import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import LoginScreen from "./screens/Login";
import TabNavigator from "./tabNavigator";
import StorageHelper from "./utils/storageHelper";
import { ActivityIndicator, Text, View } from "react-native";
import Event from "./screens/Event";

const Stack = createStackNavigator();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator
  const [loaded, error] = useFonts({
    "Urbanist-bold": require("./assets/fonts/Urbanist-Bold.ttf"),
    "Urbanist-semi": require("./assets/fonts/Urbanist-SemiBoldItalic.ttf"),
    "Urbanist-thin": require("./assets/fonts/Urbanist-Thin.ttf"),
    "Urbanist-medium": require("./assets/fonts/Urbanist-Medium.ttf"),
    "Urbanist-regular": require("./assets/fonts/Urbanist-Regular.ttf"),
  });

  const checkLoginStatus = async () => {
    try {
      const value = await StorageHelper.getItem("isLoggedIn");
      if (value !== null && value === "true") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error fetching login status:", error);
    } finally {
      setIsLoading(false); // Update loading state once check is complete
    }
  };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
    checkLoginStatus();
  });

  if (!loaded && !error) {
    return null;
  }

  // Show loading indicator while checking login status
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={
          "Event"
          // isLoggedIn ? "TabNavigator" : "Login"
        }
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Event" component={Event} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text>Loading...</Text>
  </View>
);
