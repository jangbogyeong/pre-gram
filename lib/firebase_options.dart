import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError(
        'DefaultFirebaseOptions have not been configured for web - '
        'you can reconfigure this by running the FlutterFire CLI again.',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBi_n7dB6S5GyHyE6QhRzkGlYOLlUGdFeI',
    appId: '1:834199766597:android:c9a828ceda15ee2027c52c',
    messagingSenderId: '834199766597',
    projectId: 'pregram-a4954',
    storageBucket: 'pregram-a4954.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB6-ec8tAyXlsabV8XKb5iNrOa3GRMdrzI',
    appId: '1:834199766597:ios:08cbf3242b6ac62c27c52c',
    messagingSenderId: '834199766597',
    projectId: 'pregram-a4954',
    storageBucket: 'pregram-a4954.firebasestorage.app',
    iosClientId:
        '834199766597-ijk9j4g54qq74djem4tjgl6q9ph9cm6i.apps.googleusercontent.com',
    iosBundleId: 'com.artxwork.pregram',
  );
}
