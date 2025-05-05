package com.koup28.achacha_app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// Context 확장 함수를 사용하여 DataStore 인스턴스 생성 (싱글턴으로 관리)
val Context.userDataStore: DataStore<Preferences> by preferencesDataStore(name = "user_prefs")

class UserDataStore(private val context: Context) {

    companion object {
        // 저장할 데이터의 키 정의 (FCM 토큰 예시)
        val FCM_TOKEN_KEY = stringPreferencesKey("fcm_token")
    }

    // FCM 토큰 저장 함수 (suspend 함수로 비동기 처리)
    suspend fun saveFcmToken(token: String) {
        context.userDataStore.edit {
            it[FCM_TOKEN_KEY] = token
        }
    }

    // FCM 토큰 읽기 Flow
    val fcmTokenFlow: Flow<String?> = context.userDataStore.data
        .map {
            it[FCM_TOKEN_KEY] // 키에 해당하는 값이 없으면 null 반환
        }

    // 필요하다면 다른 사용자 데이터 저장/읽기 함수 추가 가능
} 