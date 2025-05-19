package com.koup28.achacha_app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.os.Bundle;

public class LocationAlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    // 위치 업데이트 서비스 시작 (한 번만 실행)
    Intent serviceIntent = new Intent(context, BackgroundLocationService.class);
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent);
    } else {
      context.startService(serviceIntent);
    }
    
    // 다음 알람을 예약하지 않음 (매장 진입 시만 알림을 위해)
  }
  
  private void scheduleNextAlarm(Context context) {
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
    
    // 5분마다 반복 알람
    long intervalMillis = 5 * 60 * 1000; // 5분
    long triggerAtMillis = System.currentTimeMillis() + intervalMillis;
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      alarmManager.setExact(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    } else {
      alarmManager.set(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    }
  }
}