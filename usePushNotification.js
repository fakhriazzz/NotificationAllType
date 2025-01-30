import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';

const usePushNotification = () => {
    const requestUserPermission = async () => {
        if (Platform.OS === 'ios') {
            //Request iOS permission
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
            }
        } else if (Platform.OS === 'android') {
            //Request Android permission (For API level 33+, for 32 or below is not required)
            const res = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
        }
    }

    const getFCMToken = async () => {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log('Your Firebase Token is:', fcmToken);
        } else {
            console.log('Failed', 'No token received');
        }
    };

    const listenToForegroundNotifications = async () => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log(
                'A new message arrived! (FOREGROUND)',
                JSON.stringify(remoteMessage),
            );
            onDisplayNotification({ title: JSON.stringify(remoteMessage.notification.title), body: JSON.stringify(remoteMessage.notification.body) });
        });
        return unsubscribe;
    }

    const listenToBackgroundNotifications = async () => {
        const unsubscribe = messaging().setBackgroundMessageHandler(
            async remoteMessage => {
                console.log(
                    'A new message arrived! (BACKGROUND)',
                    JSON.stringify(remoteMessage),
                );
                onDisplayNotification({ title: JSON.stringify(remoteMessage.notification.title), body: JSON.stringify(remoteMessage.notification.body) });
            },
        );
        return unsubscribe;
    }

    const onNotificationOpenedAppFromBackground = async () => {
        const unsubscribe = messaging().onNotificationOpenedApp(
            async remoteMessage => {
                console.log(
                    'App opened from BACKGROUND by tapping notification:',
                    JSON.stringify(remoteMessage),
                );
                onDisplayNotification({ title: JSON.stringify(remoteMessage.notification.title), body: JSON.stringify(remoteMessage.notification.body) });
            },
        );
        return unsubscribe;
    };

    const onNotificationOpenedAppFromQuit = async () => {
        const message = await messaging().getInitialNotification();

        if (message) {
            console.log('App opened from QUIT by tapping notification:', JSON.stringify(message));
        }
    };

    async function onDisplayNotification({ title, body }) {
        // Request permissions (required for iOS)
        await notifee.requestPermission()

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        // Display a notification
        await notifee.displayNotification({
            title: title,
            body: body,
            android: {
                channelId,
                // smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
                // pressAction is needed if you want the notification to open the app when pressed
                pressAction: {
                    id: 'default',
                },
            },
        });
    }

    return {
        requestUserPermission,
        getFCMToken,
        listenToForegroundNotifications,
        listenToBackgroundNotifications,
        onNotificationOpenedAppFromBackground,
        onNotificationOpenedAppFromQuit,
    };
};

export default usePushNotification;