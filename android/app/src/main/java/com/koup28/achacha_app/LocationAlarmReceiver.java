package com.koup28.achacha_app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.os.Bundle;
import android.util.Log;

public class LocationAlarmReceiver extends BroadcastReceiver {
  private static final String TAG = "LocationAlarmReceiver";
  
  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(TAG, "알람 수신: 위치 서비스 시작");
    
    // 위치 업데이트 서비스 시작
    Intent serviceIntent = new Intent(context, BackgroundLocationService.class);
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent);
    } else {
      context.startService(serviceIntent);
    }
    
    // 다음 알람 설정
    scheduleNextAlarm(context);
  }
  
  private void scheduleNextAlarm(Context context) {
    Log.d(TAG, "다음 알람 예약");
    
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    Intent intent = new Intent(context, LocationAlarmReceiver.class);
    
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
      context, 
      0, 
      intent, 
      flags
    );
    
    // 30분마다 반복 알람 (배터리 최적화 고려하여 시간 조정 가능)
    long intervalMillis = 30 * 60 * 1000; // 5분
    long triggerAtMillis = System.currentTimeMillis() + intervalMillis;
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
      Log.d(TAG, "알람 예약됨 (setExactAndAllowWhileIdle): " + triggerAtMillis);
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      alarmManager.setExact(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
      Log.d(TAG, "알람 예약됨 (setExact): " + triggerAtMillis);
    } else {
      alarmManager.set(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
      Log.d(TAG, "알람 예약됨 (set): " + triggerAtMillis);
    }
  }
}