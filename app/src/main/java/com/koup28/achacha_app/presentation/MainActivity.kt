/* While this template provides a good starting point for using Wear Compose, you can always
 * take a look at https://github.com/android/wear-os-samples/tree/main/ComposeStarter to find the
 * most up to date changes to the libraries and their usages.
 */

package com.koup28.achacha_app.presentation

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.wear.compose.material.*
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*
import com.koup28.achacha_app.presentation.theme.AchachaAppTheme
import com.koup28.achacha_app.presentation.ui.MainMenuScreen
import com.koup28.achacha_app.presentation.ui.ConnectPhoneScreen
import com.koup28.achacha_app.presentation.ui.GifticonListScreen
import com.koup28.achacha_app.presentation.ui.GifticonDetailScreen
import com.koup28.achacha_app.presentation.ui.ApiGifticon
import java.nio.charset.StandardCharsets
import java.text.SimpleDateFormat
import java.util.*
import androidx.lifecycle.lifecycleScope
import com.koup28.achacha_app.data.UserDataStore
import com.koup28.achacha_app.data.BarcodeInfo
import com.koup28.achacha_app.data.ApiService
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import java.time.LocalDate
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import okhttp3.MediaType.Companion.toMediaType
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.LaunchedEffect

// 화면 상태 정의
enum class ScreenState {
    CONNECTING, // 초기 연결/토큰 로딩 중
    MAIN_MENU,  // 토큰 로드 완료 또는 수신 완료
    GIFTICON_LIST, // 기프티콘 목록 화면 상태 추가
    GIFTICON_DETAIL, // 기프티콘 상세 화면 상태 추가
    BARCODE, // 바코드 화면 상태 추가
    SHARE_WAITING, // 나눔 대기 화면 상태 추가
    SHARING, // 나눔 진행 화면 상태 추가
    ENTER_AMOUNT, // 금액 입력 화면 상태 추가
    NOTIFICATION_BOX, // 알림함 화면 상태 추가
    ERROR       // 권한 또는 연결 오류
}

class MainActivity : ComponentActivity() {

    companion object { // Companion object로 상수 이동
        private const val TAG = "MainActivityWear"
        // --- Nearby Connections 상수 ---
        private const val NEARBY_SERVICE_ID = "com.koup28.achacha_app.nearby_service" // 폰 앱과 동일하게
        private val NEARBY_STRATEGY = Strategy.P2P_STAR
        // -----------------------------
        // Navigation Routes (MainActivity 외부로 이동 가능)
        const val ROUTE_MAIN_MENU = "main_menu"
        const val ROUTE_GIFTICON_LIST = "gifticon_list"
        const val ROUTE_GIFTICON_DETAIL = "gifticon_detail/{gifticonId}"
        const val ROUTE_NEARBY_SEARCH = "nearby_search"
        // const val ROUTE_BARCODE = "barcode" // ScreenState로 관리하므로 라우트 문자열은 불필요
        // SimpleDateFormat for logging timestamps
        private val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    }

    // --- DataStore 인스턴스 --- (지연 초기화 사용)
    private lateinit var userDataStore: UserDataStore
    // --------------------------

    // --- Nearby Connections 클라이언트 ---
    private lateinit var connectionsClient: ConnectionsClient
    // ---------------------------------
    // --- Nearby 연결된 Endpoint ID ---
    private var nearbyConnectedEndpointId: String? = null
    private var discoveredPhoneEndpointId: String? = null // 찾은 폰 Endpoint ID
    // ------------------------------

    // --- UI State Variables ---
    private val _currentScreen = mutableStateOf(ScreenState.CONNECTING) // 화면 상태 관리
    val currentScreen: State<ScreenState> = _currentScreen

    private val _receivedToken = mutableStateOf<String?>(null) // 토큰 상태는 유지
    val receivedToken: State<String?> = _receivedToken

    private val _connectionError = mutableStateOf<String?>(null) // 오류 메시지 상태 추가
    val connectionError: State<String?> = _connectionError

    // --- 선택된 기프티콘 인덱스 상태 --- (수정)
    private val _currentGifticonIndex = mutableStateOf(-1) // -1 for no selection
    // ---------------------------------

    // --- 선택된 기프티콘 ID 상태 --- (바코드 화면 전달용)
    private val _selectedGifticonId = mutableStateOf<Int?>(null)
    // ---------------------------------

    // --- 바코드 정보 상태 --- (추가)
    private val _barcodeInfo = mutableStateOf<BarcodeInfo?>(null)
    private val _isBarcodeLoading = mutableStateOf(false)
    private val _barcodeError = mutableStateOf<String?>(null)
    // --------------------------

    // --- 금액 입력 화면용 상태 --- (추가)
    private val _selectedGifticonRemainingAmount = mutableStateOf<Int?>(null)
    // ---------------------------

    // _nearbyStatus, _errorMessage는 내부 로직용으로 유지하거나 필요시 제거
    private val _nearbyStatus = mutableStateOf("IDLE")
    private val _errorMessage = mutableStateOf<String?>(null)

    private val _logMessages = mutableStateListOf<String>() // Use mutableStateListOf for logs
    val logMessages: List<String> = _logMessages

    // --- 화면 전환을 위한 상태 변수 --- (추가)
    private val _showSetupPrompt = mutableStateOf(false)
    val showSetupPrompt: State<Boolean> = _showSetupPrompt
    // ----------------------------------

    // --- 권한 요청 관련 (기존 + Nearby 권한 추가) ---
    private val requiredPermissions = when {
        // Android 13 (API 33) 이상: NEARBY_WIFI_DEVICES 추가
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU -> {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE,
                Manifest.permission.NEARBY_WIFI_DEVICES, // 추가!
                Manifest.permission.WAKE_LOCK
            )
        }
        // Android 12 (API 31 & 32): BLUETOOTH_SCAN/ADVERTISE/CONNECT 필요
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE,
                Manifest.permission.WAKE_LOCK
            )
        }
        // Android 11 (API 30) 이하: 레거시 블루투스 및 위치 권한
        else -> {
            arrayOf(
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION, // Fine location is still recommended
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE,
                Manifest.permission.WAKE_LOCK
            )
        }
    }

    private val requestMultiplePermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        var allGranted = true
        addLog("[Perms] Checking granted permissions...")
        permissions.entries.forEach { (permission, granted) ->
            addLog("[Perms] Permission ${permission.substringAfterLast('.')} granted: $granted")
            if (!granted && requiredPermissions.contains(permission)) {
                allGranted = false
                addLog("[Perms] Required permission ${permission.substringAfterLast('.')} NOT granted.")
            }
        }

        if (allGranted) {
            addLog("[Perms] All granted. Starting discovery...")
            _connectionError.value = null
            startNearbyDiscovery()
        } else {
            val deniedMsg = "필수 권한이 거부되었습니다."
            addLog("[Perms] Error: $deniedMsg")
            _connectionError.value = deniedMsg // 오류 메시지만 설정
        }
    }
    // ------------------------------------------------

    // --- Nearby Connections 콜백들 (오류 처리 수정) ---
    // 1. Endpoint Discovery Callback
    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, discoveredInfo: DiscoveredEndpointInfo) {
            addLog("[Discovery] Found: ${discoveredInfo.endpointName} ($endpointId)")
            if (discoveredInfo.serviceId == NEARBY_SERVICE_ID) {
                addLog("[Discovery] Matching service ID. Requesting connection...")
                discoveredPhoneEndpointId = endpointId
                _errorMessage.value = "${discoveredInfo.endpointName} ($endpointId)"
                _nearbyStatus.value = "FOUND"
                requestNearbyConnection(endpointId, discoveredInfo.endpointName)
            } else {
                 addLog("[Discovery] Service ID mismatch: ${discoveredInfo.serviceId}. Ignoring.")
            }
        }
        override fun onEndpointLost(endpointId: String) {
             addLog("[Discovery] Lost: $endpointId")
            if(discoveredPhoneEndpointId == endpointId) {
                addLog("[Discovery] Discovered endpoint lost before connection.")
                _errorMessage.value = null
                 if (_nearbyStatus.value == "FOUND" || _nearbyStatus.value == "CONNECTING") {
                     _nearbyStatus.value = "DISCOVERING"
                 }
                discoveredPhoneEndpointId = null
            }
        }
    }

    // 2. Connection Lifecycle Callback (오류 처리 수정)
    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            addLog("[Connect] Initiated by ${connectionInfo.endpointName} ($endpointId). Accepting...")
            _nearbyStatus.value = "CONNECTING"
            _connectionError.value = null // 연결 시도 시 오류 초기화
            connectionsClient.acceptConnection(endpointId, payloadCallback)
                .addOnSuccessListener { addLog("[Connect] Accept success for $endpointId.") }
                .addOnFailureListener { e ->
                     addLog("[Connect] Accept failed for $endpointId: ${e.message}")
                     _connectionError.value = "연결 수락 실패: ${e.localizedMessage}" // 오류 상태 설정
                 }
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
             addLog("[Connect] Result for $endpointId: ${result.status.statusCode} - ${ConnectionsStatusCodes.getStatusCodeString(result.status.statusCode)}")
            when (result.status.statusCode) {
                ConnectionsStatusCodes.STATUS_OK -> {
                    addLog("[Connect] Connection successful! Waiting for payload.")
                    nearbyConnectedEndpointId = endpointId
                    connectionsClient.stopDiscovery() // 연결 성공 시 탐색 중지
                    addLog("[Discovery] Stopped discovery (connected).")
                    _nearbyStatus.value = "CONNECTED"
                    _connectionError.value = null // 오류 상태 초기화
                    // 화면 전환은 payload 수신 시 처리
                }
                ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED -> {
                    addLog("[Connect] Rejected by $endpointId.")
                    val errorMsg = "상대방이 연결을 거부했습니다."
                    _connectionError.value = errorMsg // 오류 상태 설정
                }
                ConnectionsStatusCodes.STATUS_ERROR -> {
                    addLog("[Connect] Error for $endpointId: ${result.status.statusMessage}")
                     val errorMsg = "연결 오류 발생: ${result.status.statusMessage}"
                    _connectionError.value = errorMsg // 오류 상태 설정
                }
                 else -> {
                     addLog("[Connect] Unknown result status: ${result.status.statusCode}")
                     val errorMsg = "알 수 없는 연결 오류: ${result.status.statusCode}"
                     _connectionError.value = errorMsg // 오류 상태 설정
                 }
            }
        }
        override fun onDisconnected(endpointId: String) {
            addLog("[Connect] Disconnected from $endpointId")
            if (nearbyConnectedEndpointId == endpointId) {
                 addLog("[Connect] Our connected endpoint disconnected.")
                resetNearbyStateInternal(true)
                 _nearbyStatus.value = "DISCONNECTED"
            }
        }
    }

    // 3. Payload Callback (토큰 저장 로직 수정)
    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            addLog("[Payload] Received from $endpointId (Type: ${payload.type})")
            if (payload.type == Payload.Type.BYTES) {
                val receivedBytes = payload.asBytes() ?: run {
                    addLog("[Payload] Received null bytes.")
                    return
                }
                val receivedString = String(receivedBytes, StandardCharsets.UTF_8)
                // 보안상 실제 토큰 값 로그 출력은 주의 (디버깅 시에만 사용)
                addLog("[Payload] Received String (potential Access Token)") // 로그 수정

                lifecycleScope.launch {
                    try {
                        userDataStore.saveAccessToken(receivedString) // 함수 이름 변경
                        addLog("[DataStore] Access Token saved successfully.") // 로그 수정
                        _receivedToken.value = receivedString // 토큰 상태 업데이트 (변수명은 유지해도 무방)
                        _connectionError.value = null      // 오류 상태 초기화
                        _currentScreen.value = ScreenState.MAIN_MENU // 메인 메뉴 화면으로 전환
                    } catch (e: Exception) {
                        addLog("[DataStore] Failed to save Access Token: ${e.message}") // 로그 수정
                        _connectionError.value = "데이터 저장 실패: ${e.localizedMessage}"
                    }
                }
            } else {
                addLog("[Payload] Received non-BYTES payload type: ${payload.type}")
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
             val statusString = when (update.status) {
                 PayloadTransferUpdate.Status.SUCCESS -> "SUCCESS"
                 PayloadTransferUpdate.Status.FAILURE -> "FAILURE"
                 PayloadTransferUpdate.Status.IN_PROGRESS -> "IN_PROGRESS"
                 PayloadTransferUpdate.Status.CANCELED -> "CANCELED"
                 else -> "UNKNOWN"
             }
             addLog("[Payload] Transfer update from $endpointId: ID ${update.payloadId}, Status $statusString (${update.bytesTransferred}/${update.totalBytes} bytes)")
        }
    }
    // ------------------------------------

    // --- Retrofit 및 ApiService 인스턴스 --- (수정: Base URL 변경)
    private val apiService: ApiService by lazy {
        val loggingInterceptor = HttpLoggingInterceptor { message ->
            Log.d(TAG, "OkHttp: $message")
        }.apply {
            level = HttpLoggingInterceptor.Level.BODY 
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .build()

        val contentType = "application/json".toMediaType()
        val json = Json { ignoreUnknownKeys = true; coerceInputValues = true } 

        Retrofit.Builder()
            .baseUrl("https://k12d205.p.ssafy.io/") // Base URL 변경
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(ApiService::class.java)
    }
    // --------------------------------------

    // --- 기프티콘 목록 관련 상태 변수 추가 ---
    private val _gifticonList = mutableStateListOf<ApiGifticon>() // 기프티콘 목록 상태
    val gifticonList: List<ApiGifticon> = _gifticonList

    private val _isGifticonListLoading = mutableStateOf(false) // 목록 로딩 상태
    val isGifticonListLoading: State<Boolean> = _isGifticonListLoading

    private val _gifticonListError = mutableStateOf<String?>(null) // 목록 로딩 오류 상태
    val gifticonListError: State<String?> = _gifticonListError
    // --------------------------------------

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        addLog("onCreate: Initializing...")

        userDataStore = UserDataStore(applicationContext)
        connectionsClient = Nearby.getConnectionsClient(this)

        addLog("onCreate: Requesting permissions...")
        checkAndRequestNearbyPermissions()

        // --- 앱 시작 시 토큰 로드 및 화면 결정 --- (수정: Access Token 확인)
        lifecycleScope.launch {
            val storedToken = userDataStore.accessTokenFlow.firstOrNull() // Flow 이름 변경
            addLog("[DataStore] onCreate: storedToken value = '$storedToken'") // storedToken 값 확인 로그 추가
            if (storedToken != null) {
                addLog("[DataStore] Loaded Access Token. Navigating to Main Menu.") // 로그 수정
                _receivedToken.value = storedToken
                _currentScreen.value = ScreenState.MAIN_MENU // 토큰 있으면 메인 메뉴
            } else {
                addLog("[DataStore] No Access Token found. Showing Connect Screen.") // 로그 수정
                _currentScreen.value = ScreenState.CONNECTING // 토큰 없으면 연결 화면
            }
        }
        // ---------------------------------------------------------

        setContent {
            AchachaAppTheme {
                // --- 현재 화면 상태에 따라 UI 렌더링 --- (수정)
                when (currentScreen.value) {
                    ScreenState.CONNECTING -> {
                        ConnectPhoneScreen(
                            onConnectClick = { 
                                addLog("ConnectPhoneScreen: Connect button clicked. Initiating Nearby connection process.")
                                checkAndRequestNearbyPermissions() // Nearby 연결 프로세스 시작
                            }
                        )
                    }
                    ScreenState.MAIN_MENU -> {
                        MainMenuScreen(
                            onGifticonManageClick = { 
                                addLog("MainMenu: Navigating to Gifticon List.")
                                _currentScreen.value = ScreenState.GIFTICON_LIST
                            },
                            onNotificationBoxClick = { 
                                addLog("MainMenu: Notification Box button clicked. Navigating to NotificationBoxScreen.")
                                _currentScreen.value = ScreenState.NOTIFICATION_BOX
                            },
                            onDeleteTokenClick = { // 토큰 삭제 콜백 수정
                                addLog("MainMenu: Delete Access Token button clicked.") // 로그 수정
                                lifecycleScope.launch {
                                    try {
                                        userDataStore.clearAccessToken() // 함수 이름 변경
                                        addLog("[DataStore] Access Token cleared successfully.") // 로그 수정
                                        _receivedToken.value = null     // 내부 토큰 상태 초기화
                                        _connectionError.value = null // 이전 연결 오류 초기화
                                        _currentScreen.value = ScreenState.CONNECTING // 연결 화면 상태로 변경
                                        resetNearbyStateInternal(false) // Nearby 관련 상태 초기화
                                        checkAndRequestNearbyPermissions() // 권한 확인 및 연결 프로세스 재시작
                                        addLog("Navigating to CONNECTING screen and re-initiating connection process after token deletion.")
                                    } catch (e: Exception) {
                                        addLog("[DataStore] Failed to clear Access Token: ${e.message}") // 로그 수정
                                        _connectionError.value = "토큰 삭제 중 오류: ${e.localizedMessage}" 
                                    }
                                }
                            }
                        )
                    }
                    ScreenState.GIFTICON_LIST -> {
                        // 화면 진입 시 기프티콘 목록 로드
                        LaunchedEffect(Unit) { // Unit 키: 화면에 처음 진입할 때만 실행
                            fetchGifticons() // 첫 페이지 로드
                        }
                        GifticonListScreen(
                            gifticons = gifticonList, // 실제 데이터 전달
                            isLoading = isGifticonListLoading.value, // 로딩 상태 전달
                            error = gifticonListError.value, // 오류 상태 전달
                            onGifticonClick = { gifticonId ->
                                addLog("GifticonList: Clicked on gifticon ID: $gifticonId")
                                // gifticonList에서 인덱스 찾기로 변경
                                val clickedIndex = gifticonList.indexOfFirst { it.gifticonId == gifticonId }
                                if (clickedIndex != -1) {
                                    _currentGifticonIndex.value = clickedIndex 
                                    _selectedGifticonId.value = gifticonId 
                                    _currentScreen.value = ScreenState.GIFTICON_DETAIL
                                } else {
                                    addLog("[Error] Clicked gifticon ID not found in list: $gifticonId")
                                }
                            },
                            onBackPress = { 
                                _gifticonList.clear() // 목록 화면 벗어날 때 리스트 초기화 (선택적)
                                _gifticonListError.value = null // 오류 상태 초기화
                                _currentScreen.value = ScreenState.MAIN_MENU 
                            }
                            // onLoadMore = { /* 페이지네이션 구현 시 */ }
                        )
                    }
                    ScreenState.GIFTICON_DETAIL -> {
                        // Check if index is valid before rendering
                        if (_currentGifticonIndex.value != -1 && _selectedGifticonId.value != null) {
                            GifticonDetailScreen(
                                // Pass the full list, initial index, and callback (수정)
                                gifticons = gifticonList,
                                initialIndex = _currentGifticonIndex.value,
                                onCurrentGifticonIndexChanged = { newIndex ->
                                    _currentGifticonIndex.value = newIndex // Update state on swipe
                                    _selectedGifticonId.value = gifticonList.getOrNull(newIndex)?.gifticonId
                                },
                                onShowBarcodeClick = { gifticonId ->
                                    addLog("GifticonDetail: Show barcode clicked for ID: $gifticonId")
                                    _selectedGifticonId.value = gifticonId // 바코드 볼 ID 저장
                                    _currentScreen.value = ScreenState.BARCODE // 바코드 화면으로 전환
                                    fetchBarcodeInfo(gifticonId) // API 호출
                                },
                                onShareClick = { gifticonId ->
                                    addLog("GifticonDetail: Share clicked for ID: $gifticonId")
                                    _selectedGifticonId.value = gifticonId // 나눔할 ID 저장
                                    _currentScreen.value = ScreenState.SHARE_WAITING // 나눔 대기 화면으로 전환
                                    // TODO: 실제 나눔 요청 API 호출 또는 로직 구현
                                },
                                onUseClick = { gifticonId ->
                                    addLog("GifticonDetail: Use clicked for ID: $gifticonId")
                                    // 클릭된 기프티콘 정보 찾기 (타입, 잔액 확인용)
                                    val clickedGifticon = gifticonList.find { it.gifticonId == gifticonId }
                                    if (clickedGifticon != null) {
                                        if (clickedGifticon.gifticonType == "AMOUNT") {
                                            // 금액권일 경우
                                            addLog("GifticonDetail: Amount type gifticon. Navigating to EnterAmountScreen.")
                                            _selectedGifticonId.value = gifticonId // ID 저장
                                            _selectedGifticonRemainingAmount.value = clickedGifticon.gifticonRemainingAmount // 잔액 저장
                                            _currentScreen.value = ScreenState.ENTER_AMOUNT // 금액 입력 화면으로 전환
                                        } else {
                                            // 상품권일 경우 (직접 사용 처리)
                                            addLog("GifticonDetail: Product type gifticon. Triggering use action.")
                                            // TODO: 상품권 사용 처리 API 호출 구현
                                        }
                                    } else {
                                        addLog("[Error] Clicked gifticon for use not found: $gifticonId")
                                    }
                                },
                                onBackPress = { _currentScreen.value = ScreenState.GIFTICON_LIST }
                            )
                        } else {
                            // Handle invalid index state (e.g., navigate back or show error)
                            addLog("[Error] Invalid gifticon index: ${_currentGifticonIndex.value}. Navigating back to list.")
                            // Potentially navigate back automatically
                            LaunchedEffect(Unit) { _currentScreen.value = ScreenState.GIFTICON_LIST }
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text("Error: Invalid Gifticon Index")
                            }
                        }
                    }
                    ScreenState.SHARE_WAITING -> {
                        com.koup28.achacha_app.presentation.ui.ShareWaitScreen(
                            // gifticonId = _selectedGifticonId.value, // ShareWaitScreen에서 직접 사용하지 않음
                            onBackClick = {
                                addLog("ShareWaitScreen: Back clicked (or tapped). Returning to GifticonDetail.")
                                _currentScreen.value = ScreenState.GIFTICON_DETAIL
                            },
                            onSwipeUpToShare = {
                                addLog("ShareWaitScreen: Swiped up. Navigating to SharingScreen with ID: ${_selectedGifticonId.value}")
                                _currentScreen.value = ScreenState.SHARING
                                // TODO: 실제 나눔 시작 로직 (Nearby Advertising 시작 등)은 여기서 또는 SharingScreen에서 호출
                            }
                        )
                    }
                    ScreenState.SHARING -> {
                        com.koup28.achacha_app.presentation.ui.SharingScreen(
                            gifticonId = _selectedGifticonId.value,
                            onBackClick = {
                                addLog("SharingScreen: Back clicked. Returning to GifticonDetail.")
                                // TODO: 나눔 중단/완료 관련 로직 (Nearby 중단 등) 필요시 추가
                                _currentScreen.value = ScreenState.GIFTICON_DETAIL // 상세 화면으로 바로 돌아감
                            }
                        )
                    }
                    ScreenState.BARCODE -> {
                        com.koup28.achacha_app.presentation.ui.BarcodeScreen(
                            gifticonId = _selectedGifticonId.value, // BarcodeScreen 자체에서 ID가 필요할 수 있음
                            barcodeInfo = _barcodeInfo.value,
                            isLoading = _isBarcodeLoading.value,
                            error = _barcodeError.value,
                            onBackClick = {
                                addLog("BarcodeScreen: Back clicked. Returning to GifticonDetail.")
                                _barcodeInfo.value = null // 상태 초기화
                                _barcodeError.value = null
                                _currentScreen.value = ScreenState.GIFTICON_DETAIL
                            },
                            onRetryClick = {
                                _selectedGifticonId.value?.let { fetchBarcodeInfo(it) }
                            }
                        )
                    }
                    ScreenState.ENTER_AMOUNT -> {
                        com.koup28.achacha_app.presentation.ui.EnterAmountScreen(
                            gifticonId = _selectedGifticonId.value,
                            remainingAmount = _selectedGifticonRemainingAmount.value,
                            onConfirmClick = { amountToUse -> // 콜백에서 다시 금액 받음
                                addLog("EnterAmountScreen: Confirm clicked. Amount to use: $amountToUse for ID: ${_selectedGifticonId.value}")
                                // TODO: 입력된 금액 사용 처리 API 호출 구현 (amountToUse 사용)
                                _currentScreen.value = ScreenState.GIFTICON_DETAIL // 사용 후 상세 화면으로 복귀
                                // 상태 초기화는 EnterAmountScreen 내부 또는 여기서 필요시
                            },
                            onCancelClick = {
                                addLog("EnterAmountScreen: Cancel clicked. Returning to GifticonDetail.")
                                _currentScreen.value = ScreenState.GIFTICON_DETAIL // 취소 시 상세 화면으로 복귀
                            }
                        )
                    }
                    ScreenState.NOTIFICATION_BOX -> {
                        com.koup28.achacha_app.presentation.ui.NotificationBoxScreen(
                            onBackClick = {
                                addLog("NotificationBoxScreen: Back clicked. Returning to MainMenu.")
                                _currentScreen.value = ScreenState.MAIN_MENU // 메인 메뉴로 돌아가기
                            }
                        )
                    }
                    ScreenState.ERROR -> {
                        ConnectPhoneScreen(
                             onConnectClick = { // 에뮬레이터 테스트용 임시 수정
                                 addLog("[DEBUG_EMULATOR] Retrying from error state. Forcing navigation to Main Menu.")
                                 _connectionError.value = null // 오류 초기화
                                 _currentScreen.value = ScreenState.MAIN_MENU // 에러 시에도 일단 메인으로 (임시)
                                 // checkAndRequestNearbyPermissions() // 원래 재시도 로직
                             }
                            // TODO: 오류 화면을 별도로 만들거나 ConnectPhoneScreen 개선 필요
                        )
                    }
                }
                // -----------------------------------------
            }
        }
    }

    // --- 재시작 시 처리 --- (자동 재시도 로직 제거)
    override fun onStart() {
        super.onStart()
        // 자동 재시도 로직 제거
    }

    // --- Nearby Discovery 시작 함수 ---
    private fun startNearbyDiscovery() {
        addLog("[Discovery] Attempting to start...")
        _nearbyStatus.value = "DISCOVERING"
        _errorMessage.value = null
        _connectionError.value = null
        val discoveryOptions = DiscoveryOptions.Builder().setStrategy(NEARBY_STRATEGY).build()
        connectionsClient.startDiscovery(
            NEARBY_SERVICE_ID,
            endpointDiscoveryCallback,
            discoveryOptions
        ).addOnSuccessListener {
            addLog("[Discovery] Started successfully!")
        }.addOnFailureListener { e ->
            addLog("[Discovery] Failed to start: ${e.message}")
            _connectionError.value = "Discovery failed: ${e.message}"
             _nearbyStatus.value = "ERROR"
        }
    }
    // ----------------------------------

    // --- Nearby Discovery 중지 함수 ---
    private fun stopNearbyDiscovery() {
        addLog("[Discovery] Stopping...")
        connectionsClient.stopDiscovery()
         addLog("[Discovery] Stopped.")
        if (_nearbyStatus.value == "DISCOVERING" || _nearbyStatus.value == "FOUND") {
             _nearbyStatus.value = "IDLE"
        }
    }
    // ----------------------------------

    // --- Nearby 연결 요청 함수 ---
    private fun requestNearbyConnection(endpointId: String, endpointName: String) {
         addLog("[Connect] Requesting connection to $endpointName ($endpointId)")
         _nearbyStatus.value = "CONNECTING"
         val localEndpointName = Build.MODEL
         connectionsClient.requestConnection(
            localEndpointName,
            endpointId,
            connectionLifecycleCallback
        ).addOnSuccessListener {
             addLog("[Connect] Request sent successfully.")
         }.addOnFailureListener { e ->
             addLog("[Connect] Failed to send request: ${e.message}")
             _connectionError.value = "Request failed: ${e.message}"
             _nearbyStatus.value = "ERROR"
              _errorMessage.value = null
              discoveredPhoneEndpointId = null
         }
     }
    // -----------------------------

    // Internal function to reset Nearby state variables
    private fun resetNearbyStateInternal(logDisconnect: Boolean) {
        if (logDisconnect && nearbyConnectedEndpointId != null) {
            addLog("[State] Resetting state (disconnected). Status: DISCONNECTED")
            _nearbyStatus.value = "DISCONNECTED"
        } else if (_nearbyStatus.value != "ERROR") {
            addLog("[State] Resetting state. Status: IDLE")
            _nearbyStatus.value = "IDLE"
        }
        nearbyConnectedEndpointId = null
        discoveredPhoneEndpointId = null
        _errorMessage.value = null
        _receivedToken.value = null
    }

    // 권한 확인 및 요청 함수 (Nearby 용으로 수정)
    private fun checkAndRequestNearbyPermissions() {
        val permissionsToRequest = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (permissionsToRequest.isNotEmpty()) {
            addLog("[Perms] Requesting: ${permissionsToRequest.joinToString{it.substringAfterLast('.')}}")
            requestMultiplePermissionsLauncher.launch(permissionsToRequest.toTypedArray())
        } else {
            addLog("[Perms] All granted. Starting discovery...")
            startNearbyDiscovery()
        }
    }

    // Helper function to add timestamped logs to the list
    private fun addLog(message: String) {
        val timestamp = timeFormat.format(Date())
        val logEntry = "$timestamp: $message"
        Log.d(TAG, logEntry)
        if (_logMessages.size >= 50) {
            _logMessages.removeAt(0)
        }
        _logMessages.add(logEntry)
    }

    private fun disconnectNearby() {
        // Implementation of disconnectNearby function
    }

    // --- 기프티콘 목록 API 호출 함수 추가 ---
    private fun fetchGifticons(page: Int = 0) {
        if (_isGifticonListLoading.value && page == 0) return // 이미 로딩 중이면 중복 호출 방지 (첫 페이지 로드 시)
        // TODO: 페이지네이션 시에는 로딩 중이어도 다음 페이지 호출은 허용할 수 있음

        addLog("[API] Fetching gifticon list (page: $page)...")
        _isGifticonListLoading.value = true
        _gifticonListError.value = null
        if (page == 0) {
            _gifticonList.clear() // 첫 페이지 로드 시 기존 목록 초기화
        }

        lifecycleScope.launch {
            val token = userDataStore.accessTokenFlow.firstOrNull() // 기존 토큰 로드 로직으로 복원
            if (token.isNullOrEmpty()) {
                _gifticonListError.value = "인증 토큰이 없습니다."
                _isGifticonListLoading.value = false
                addLog("[API] Error: Access Token is missing.")
                // TODO: 에러 상태를 좀 더 명확히 전달하거나, 연결 화면으로 유도?
                _currentScreen.value = ScreenState.CONNECTING // 예: 토큰 없으면 연결 화면으로
                return@launch
            }

            val authorizationHeader = "Bearer $token"

            try {
                val response = apiService.getAvailableGifticons(
                    authorization = authorizationHeader,
                    page = page
                    // 필요시 scope, type, sort, size 등 파라미터 추가 전달
                )

                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    if (apiResponse != null) {
                        _gifticonList.addAll(apiResponse.gifticons) // 받아온 목록 추가
                        // 페이지네이션 상태 업데이트 로직 추가 가능
                        addLog("[API] Gifticon list fetched successfully. Count: ${apiResponse.gifticons.size}, HasNext: ${apiResponse.hasNextPage}")
                    } else {
                        _gifticonListError.value = "데이터 수신 실패 (null response)"
                        addLog("[API] Error: Received null response body.")
                    }
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    _gifticonListError.value = "목록 로딩 실패 (${response.code()})"
                    addLog("[API] Error fetching gifticon list: ${response.code()} - $errorBody")
                     if (response.code() == 401) { // 예: 인증 오류 시
                         // 토큰 만료 또는 무효 처리 -> 연결 화면으로 이동 등
                         addLog("[API] Unauthorized. Token might be invalid. Clearing token and navigating to connect.")
                         userDataStore.clearAccessToken()
                         _receivedToken.value = null
                         _currentScreen.value = ScreenState.CONNECTING
                     }
                }
            } catch (e: Exception) {
                _gifticonListError.value = "네트워크 오류: ${e.localizedMessage}"
                addLog("[API] Exception fetching gifticon list: ${e.message}")
            } finally {
                _isGifticonListLoading.value = false
            }
        }
    }
    // ------------------------------------

    // --- 바코드 정보 가져오기 함수 (수정: 인증 헤더 추가) ---
    private fun fetchBarcodeInfo(gifticonId: Int) {
        addLog("[API] Fetching barcode for ID: $gifticonId") 
        _isBarcodeLoading.value = true
        _barcodeError.value = null
        _barcodeInfo.value = null 

        lifecycleScope.launch {
            val token = userDataStore.accessTokenFlow.firstOrNull()
            if (token.isNullOrEmpty()) {
                _barcodeError.value = "인증 토큰 없음"
                _isBarcodeLoading.value = false
                addLog("[API] Barcode Error: Access Token missing.")
                // TODO: 에러 처리 또는 연결 화면 유도?
                _currentScreen.value = ScreenState.CONNECTING
                return@launch
            }
            val authorizationHeader = "Bearer $token"

            try {
                // API 호출 방식 (Mock 제거, 실제 호출) - ApiService 인터페이스에 맞게 호출
                val response = apiService.getGifticonBarcode(authorizationHeader, gifticonId)
                if (response.isSuccessful) {
                    _barcodeInfo.value = response.body()
                    addLog("[API] Barcode fetched successfully: ${response.body()}")
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    addLog("[API] Error fetching barcode: ${response.code()} - $errorBody")
                    _barcodeError.value = "바코드 정보 로딩 실패 (${response.code()})"
                     if (response.code() == 401) {
                         addLog("[API] Barcode Unauthorized. Token might be invalid.")
                         userDataStore.clearAccessToken()
                         _receivedToken.value = null
                         _currentScreen.value = ScreenState.CONNECTING
                     }
                }
            } catch (e: Exception) {
                addLog("[API] Exception fetching barcode: ${e.message}")
                _barcodeError.value = "바코드 로딩 중 오류: ${e.localizedMessage}"
            } finally {
                _isBarcodeLoading.value = false
            }
        }
    }
    // ------------------------------------
}

// --- 임시 데이터 제거 또는 주석 처리 --- 
// val tempGifticonList = List(5) { ... } 제거 또는 주석 처리