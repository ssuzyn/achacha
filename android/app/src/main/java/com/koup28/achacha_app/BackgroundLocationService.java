// BackgroundLocationService.java
package com.koup28.achacha_app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.NotificationCompat;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BackgroundLocationService extends HeadlessJsTaskService {
  private static final int NOTIFICATION_ID = 1234;
  private static final String CHANNEL_ID = "location_notification_channel";

  @Override
  public void onCreate() {
    super.onCreate();
    
    // Android 8.0 이상에서는 포그라운드 서비스 필수
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      createNotificationChannel();
      startForeground(NOTIFICATION_ID, buildNotification());
    }
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "위치 추적",
        NotificationManager.IMPORTANCE_LOW
      );
      channel.setDescription("백그라운드에서 위치를 추적하고 주변 매장을 찾습니다");
      
      NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      manager.createNotificationChannel(channel);
    }
  }

  private Notification buildNotification() {
    return new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("아차차")
      .setContentText("주변 매장의 기프티콘을 찾고 있어요")
      .setSmallIcon(R.drawable.ic_notification) // 적절한 아이콘으로 변경
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .build();
  }

  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) {
      extras = new Bundle();
    }
    return new HeadlessJsTaskConfig(
      "background-location-tracking", // App.js와 동일한 태스크 이름 사용
      Arguments.fromBundle(extras),
      30000, // 작업 시간 제한: 30초
      true // 앱이 포그라운드에 있어도 실행
    );
  }
}