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
import com.koup28.achacha_app.presentation.theme.MyApplicationTheme
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
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import java.time.LocalDate

// 화면 상태 정의
enum class ScreenState {
    CONNECTING, // 초기 연결/토큰 로딩 중
    MAIN_MENU,  // 토큰 로드 완료 또는 수신 완료
    GIFTICON_LIST, // 기프티콘 목록 화면 상태 추가
    GIFTICON_DETAIL, // 기프티콘 상세 화면 상태 추가
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
        const val ROUTE_BARCODE = "barcode"
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

    // 3. Payload Callback (화면 전환 로직 추가)
    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            addLog("[Payload] Received from $endpointId (Type: ${payload.type})")
            if (payload.type == Payload.Type.BYTES) {
                val receivedBytes = payload.asBytes() ?: run {
                    addLog("[Payload] Received null bytes.")
                    return
                }
                val receivedString = String(receivedBytes, StandardCharsets.UTF_8)
                addLog("[Payload] Received String: '$receivedString'")

                lifecycleScope.launch {
                    try {
                        userDataStore.saveFcmToken(receivedString)
                        addLog("[DataStore] Token saved successfully.")
                        _receivedToken.value = receivedString // 토큰 상태 업데이트
                        _connectionError.value = null      // 오류 상태 초기화
                        _currentScreen.value = ScreenState.MAIN_MENU // 메인 메뉴 화면으로 전환
                    } catch (e: Exception) {
                        addLog("[DataStore] Failed to save token: ${e.message}")
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

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        addLog("onCreate: Initializing...")

        // --- DataStore 초기화 --- (connectionsClient 초기화 전후 상관 없음)
        userDataStore = UserDataStore(applicationContext)
        // ----------------------

        connectionsClient = Nearby.getConnectionsClient(this)

        addLog("onCreate: Requesting permissions...")
        checkAndRequestNearbyPermissions()

        // --- 앱 시작 시 토큰 로드 및 화면 결정 --- (수정)
        lifecycleScope.launch {
            val storedToken = userDataStore.fcmTokenFlow.firstOrNull()
            if (storedToken != null) {
                addLog("[DataStore] Loaded token. Navigating to Main Menu.")
                _receivedToken.value = storedToken
                _currentScreen.value = ScreenState.MAIN_MENU // 토큰 있으면 메인 메뉴
            } else {
                addLog("[DataStore] No token found. Showing Connect Screen.")
                _currentScreen.value = ScreenState.CONNECTING // 토큰 없으면 연결 화면
            }
        }
        // ---------------------------------------------------------

        setContent {
             MyApplicationTheme {
                 // --- 현재 화면 상태에 따라 UI 렌더링 --- (수정)
                 when (currentScreen.value) {
                     ScreenState.CONNECTING -> {
                         ConnectPhoneScreen(
                             onConnectClick = { // 에뮬레이터 테스트용 임시 수정 유지
                                 addLog("[DEBUG_EMULATOR] Skipping Nearby connection. Forcing navigation to Main Menu.")
                                 _currentScreen.value = ScreenState.MAIN_MENU
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
                                 addLog("MainMenu: Notification Box button clicked.")
                                 // TODO: 알림함 화면으로 이동 구현
                             }
                         )
                     }
                     ScreenState.GIFTICON_LIST -> {
                         GifticonListScreen(
                             onGifticonClick = { gifticonId ->
                                 addLog("GifticonList: Clicked on gifticon ID: $gifticonId")
                                 // --- 클릭된 ID로 인덱스 찾기 --- (수정)
                                 val clickedIndex = tempGifticonList.indexOfFirst { it.gifticonId == gifticonId }
                                 if (clickedIndex != -1) {
                                     _currentGifticonIndex.value = clickedIndex // 인덱스 저장
                                     _currentScreen.value = ScreenState.GIFTICON_DETAIL
                                 } else {
                                     addLog("[Error] Clicked gifticon ID not found in list: $gifticonId")
                                     // Optional: Show error message to user
                                 }
                                 // --------------------------------
                             }
                         )
                     }
                     ScreenState.GIFTICON_DETAIL -> {
                         // Check if index is valid before rendering
                         if (_currentGifticonIndex.value != -1) {
                             GifticonDetailScreen(
                                 // Pass the full list, initial index, and callback (수정)
                                 gifticons = tempGifticonList,
                                 initialIndex = _currentGifticonIndex.value,
                                 onCurrentGifticonIndexChanged = { newIndex ->
                                     _currentGifticonIndex.value = newIndex // Update state on swipe
                                 },
                                 onShowBarcodeClick = { gifticonId ->
                                     addLog("GifticonDetail: Show barcode clicked for ID: $gifticonId")
                                     // TODO: 바코드 화면으로 이동 또는 바코드 표시 로직 구현
                                 },
                                 // Implement new callbacks
                                 onShareClick = { gifticonId ->
                                     addLog("GifticonDetail: Share clicked for ID: $gifticonId")
                                     // TODO: 나눔 기능 구현
                                 },
                                 onUseClick = { gifticonId ->
                                     addLog("GifticonDetail: Use clicked for ID: $gifticonId")
                                     // TODO: 사용 처리 기능 구현 (API 호출 등)
                                 }
                             )
                         } else {
                             // Handle invalid index state (e.g., navigate back or show error)
                             addLog("[Error] Invalid gifticon index: ${_currentGifticonIndex.value}. Navigating back to list.")
                             // Potentially navigate back automatically
                             // LaunchedEffect(Unit) { _currentScreen.value = ScreenState.GIFTICON_LIST }
                             Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                 Text("Error: Invalid Gifticon Index")
                             }
                         }
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
}

// --- 임시 데이터 (람다 파라미터 타입 명시) ---
val tempGifticonList = List(5) { index -> // 파라미터 이름 'index' 명시
    ApiGifticon(
        gifticonId = index + 100,
        gifticonName = "API 상품명 ${index + 1} 테스트",
        gifticonExpiryDate = LocalDate.now().plusDays( (index * 7).toLong() - 2).toString(),
        brandName = "API 브랜드 ${index % 2}",
        thumbnailPath = if (index % 3 == 0) null else "/images/dummy.jpg" 
    )
}
// ---------------------------------------------