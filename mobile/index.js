// Register FCM/notifee background handlers before the app entry so incoming-call
// wake-ups are processed even when the app is killed.
import './src/lib/push-background';
import 'expo-router/entry';
