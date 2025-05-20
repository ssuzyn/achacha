package com.koup28.achacha_app;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BackgroundLocationService extends HeadlessJsTaskService {
  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) {
      extras = new Bundle();
    }
    return new HeadlessJsTaskConfig(
      "BACKGROUND_LOCATION_UPDATE",
      Arguments.fromBundle(extras),
      30000, // 작업 시간 제한: 30초
      true // 앱이 포그라운드에 있어도 실행
    );
  }
}