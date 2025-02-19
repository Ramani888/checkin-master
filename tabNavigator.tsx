import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Setting from './screens/Setting';
import DatabaseExporter from './screens/SignOut';
import StorageHelper from './utils/storageHelper';
import EventDetails from './screens/EventDetails';
import AllEvents from './screens/AllEvents';
import colors from './utils/colors';
import { log, logError } from './utils/logger';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const EventsStack = () => (
  <Stack.Navigator initialRouteName="AllEvents" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AllEvents" component={AllEvents} />
    <Stack.Screen name="EventDetails" component={EventDetails} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const [checkingToken, setCheckingToken] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Setting');
  const navigation = useNavigation();

  useEffect(() => {
    shouldNavigate();
  }, []);

  const shouldNavigate = async () => {
    try {
      const tokenValid = await StorageHelper.isTokenValid();
      setInitialRoute(tokenValid ? 'Events' : 'Setting');
      // if (!tokenValid) {
      //   Alert.alert('Session is expired, please log in again', '', [
      //     {
      //       text: 'OK',
      //       onPress: () => navigation.navigate('Setting'),
      //     },
      //   ]);
      // }
    } catch (error) {
      logError('Error checking token:', error);
      Alert.alert('Failed to check token validity');
    } finally {
      setCheckingToken(false);
    }
  };

  const handleTabPress = async (routeName: string) => {
    // const tokenValid = await StorageHelper.isTokenValid();
    // log(routeName + "  IsToken Valid :  " + tokenValid)
    // if (!tokenValid) {
    //   Alert.alert('Session is expired, please log in again', '', [
    //     {
    //       text: 'OK',
    //       onPress: () => navigation.navigate('Setting'),
    //     },
    //   ]);
    // } else {
      navigation.navigate(routeName);
    // }
  };

  if (checkingToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking Token...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.hintTextColor,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { display: 'flex' },
      }}
    >
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
          tabBarLabel: 'Setting',
          tabBarActiveTintColor:'#007AFF',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="settings" color={focused ? '#007AFF' : colors.hintTextColor} size={size} />
          ),
        }}
        listeners={{ tabPress: () => handleTabPress('Setting') }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarLabel: 'Events',
          tabBarActiveTintColor:'#007AFF',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="file-tray" color={focused ? '#007AFF' : colors.hintTextColor} size={size} />
          ),
        }}
        listeners={{ tabPress: () => handleTabPress('Events') }}
      />
      <Tab.Screen
        name="Sign Out"
        component={DatabaseExporter}
        options={{
          tabBarLabel: 'Sign Out',
          tabBarActiveTintColor:'#007AFF',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="log-out" color={focused ? '#007AFF' : colors.hintTextColor} size={size} />
          ),
        }}
        listeners={{ tabPress: () => handleTabPress('Sign Out') }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
