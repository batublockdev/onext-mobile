// useNotifications.js
import * as Notifications from "expo-notifications";
export function useNotifications() {
  const getToken = async () => {
    const { status } = await Notifications.getPermissionsAsync();

    let finalStatus = status;
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }


  };

  return getToken;
}
