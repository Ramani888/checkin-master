// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import { CommonActions, useNavigation } from '@react-navigation/native';
// import StorageHelper from '../utils/storageHelper';
// import mydb from '../database/mydb';
// import { changeUserStatus } from '../apis/mapToEvent';
// import { log, logError } from '../utils/logger';
// import NetInfo from '@react-native-community/netinfo';
// import strings from '../utils/strings';

// const DatabaseExporter = () => {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [pendingSync, setPendingSync] = useState([]);
//   const [token, setToken] = useState('');

//   const checkInternetConnectivity = async () => {
//     const netInfoState = await NetInfo.fetch();
//     return netInfoState.isConnected;
//   };

//   useEffect(() => {
//     const fetchPendingSyncCount = async () => {
//       try {
//         const count = await mydb.getPendingSyncCount();
//         setPendingSync(count);
//       } catch (error) {
//         logError('Error fetching pending sync count:', error);
//       }
//     };
//     const checkToken = async () => {
//       try {
//         const storedToken = await StorageHelper.getItem('token');
//         log('token: ', storedToken);
//         if (storedToken) {
//           setToken(storedToken);
//         }
//       } catch (error) {
//         logError('Failed to retrieve token:', error);
//       }
//     };

//     fetchPendingSyncCount();
//     checkToken();
//   }, []);

//   const copyDatabaseFile = async () => {
//     try {
//       const dbPath = `${FileSystem.documentDirectory}SQLite/myDB.db`;

//       await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite', { intermediates: true });

//       const randomNumber = Math.floor(Math.random() * 10000);

//       const newDbPath = `${FileSystem.documentDirectory}myDB${randomNumber}.db`;
//       await FileSystem.copyAsync({
//         from: dbPath,
//         to: newDbPath,
//       });

//       log('Database file copied successfully to:', newDbPath);
//       return newDbPath;
//     } catch (error) {
//       logError('Error copying database file:', error);
//       throw error;
//     }
//   };

//   const shareDatabaseFile = async () => {
//     try {
//       const dbPath = await copyDatabaseFile();
//       if (dbPath && await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(dbPath);
//       } else {
//         Alert.alert('Sharing is not available on this device');
//       }
//     } catch (error) {
//       Alert.alert('Error sharing database file', error.message);
//     }
//   };

//   const handleTabPress = async () => {
//     Alert.alert(
//       'Confirm Logout',
//       'Are you sure you want to logout? Your event data will be deleted and you will have to add events again.',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Okay',
//           onPress: logout,
//         },
//       ],
//       { cancelable: false }
//     );
//   };

//   const logout = async () => {
//     setLoading(true);
//     try {
//       await StorageHelper.saveItem('isLoggedIn', 'false');
//       await StorageHelper.saveItem('token', '');
//       await mydb.removeAllData();
//       setTimeout(() => {
//         setLoading(false);
//         navigation.dispatch(
//           CommonActions.reset({
//             index: 0,
//             routes: [{ name: 'Login' }],
//           })
//         );
//       }, 500);
//     } catch (error) {
//       setLoading(false);
//       logError('Error during logout:', error);
//     }
//   };

//   const syncData = async () => {
//     const isConnected = await checkInternetConnectivity();
//     if (!isConnected) {
//       Alert.alert(strings.noInternet);
//       return;
//     }
//     setLoading(true);

//     try {
//       for (const item of pendingSync) {
//         log(`Syncing item: ${item.id}`);
//         const isSuccess = await changeUserStatus(item.user_id, item.event_id, item.progressionStatus, token);
//         if (isSuccess) {
//           item.isSync = 0;
//           await mydb.updateUser(item);
//         } else {
//           Alert.alert('Error in syncing Data');
//           return;
//         }
//       }
//       setPendingSync([]);
//       log('Data sync completed successfully.');
//     } catch (error) {
//       logError('Error syncing data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#0000ff" />
//           <Text>Syncing data...</Text>
//         </View>
//       ) : (
//         <>
//           <Text style={styles.heading}>Important Information</Text>
//           <Text style={styles.content}>
//             If you choose to logout, your event data will be deleted and you will have to add events again. Please make sure to export your database before logging out to prevent any potential data loss.
//           </Text>
//           {pendingSync && pendingSync.length > 0 ? (
//             <>
//               <TouchableOpacity style={styles.syncButton} onPress={syncData}>
//                 <Text style={styles.buttonText}>Sync Data</Text>
//               </TouchableOpacity>
//               <Text style={styles.pendingSyncText}>Pending Sync Count: {pendingSync.length}</Text>
//             </>
//           ) : (
//             <>
//               <TouchableOpacity style={styles.logoutButton} onPress={handleTabPress}>
//                 <Text style={styles.buttonText}>Logout</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.exportButton} onPress={shareDatabaseFile}>
//                 <Text style={styles.buttonText}>Export Database</Text>
//               </TouchableOpacity>
//               <Text style={styles.pendingSyncText}>Pending Sync Count: 0</Text>
//             </>
//           )}
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   loaderContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#333',
//   },
//   content: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#666',
//   },
//   logoutButton: {
//     backgroundColor: '#ff6347',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginVertical: 10,
//     width: '80%',
//   },
//   exportButton: {
//     backgroundColor: '#66cccc',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginVertical: 10,
//     width: '80%',
//   },
//   syncButton: {
//     backgroundColor: '#66cc66',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginVertical: 10,
//     width: '80%',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   pendingSyncText: {
//     marginTop: 20,
//     fontSize: 16,
//     color: '#333',
//   },
// });

// export default DatabaseExporter;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity,Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CommonActions, useNavigation } from '@react-navigation/native';
import StorageHelper from '../utils/storageHelper';
import mydb from '../database/mydb';
import { changeUserStatus } from '../apis/mapToEvent';
import { log, logError } from '../utils/logger';
import NetInfo from '@react-native-community/netinfo';
import strings from '../utils/strings';
import colors from '../utils/colors';

const DatabaseExporter = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [pendingSync, setPendingSync] = useState([]);
  const [token, setToken] = useState('');

  const checkInternetConnectivity = async () => {
    const netInfoState = await NetInfo.fetch();
    return netInfoState.isConnected;
  };

  useEffect(() => {
    const fetchPendingSyncCount = async () => {
      try {
        const count = await mydb.getPendingSyncCount();
        setPendingSync(count);
      } catch (error) {
        logError('Error fetching pending sync count:', error);
      }
    };
    const checkToken = async () => {
      try {
        const storedToken = await StorageHelper.getItem('token');
        log('token: ', storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        logError('Failed to retrieve token:', error);
      }
    };

    fetchPendingSyncCount();
    checkToken();
  }, []);

  const copyDatabaseFile = async () => {
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/myDB.db`;

      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite', { intermediates: true });

      const randomNumber = Math.floor(Math.random() * 10000);

      const newDbPath = `${FileSystem.documentDirectory}myDB${randomNumber}.db`;
      await FileSystem.copyAsync({
        from: dbPath,
        to: newDbPath,
      });

      log('Database file copied successfully to:', newDbPath);
      return newDbPath;
    } catch (error) {
      logError('Error copying database file:', error);
      throw error;
    }
  };

  const shareDatabaseFile = async () => {
    try {
      const dbPath = await copyDatabaseFile();
      if (dbPath && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dbPath);
      } else {
        Alert.alert('Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error sharing database file', error.message);
    }
  };

  const handleTabPress = async () => {
    if (pendingSync && pendingSync.length > 0) {
      Alert.alert('Pending Data', 'Some data is pending to sync. Please sync it first.');
    } else {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to logout? Your event data will be deleted and you will have to add events again.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Okay',
            onPress: logout,
          },
        ],
        { cancelable: false }
      );
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await StorageHelper.saveItem('isLoggedIn', 'false');
      await StorageHelper.saveItem('token', '');
      await mydb.removeAllData();
      setTimeout(() => {
        setLoading(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }, 500);
    } catch (error) {
      setLoading(false);
      logError('Error during logout:', error);
    }
  };

  const syncData = async () => {
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      Alert.alert(strings.noInternet);
      return;
    }
    setLoading(true);

    try {
      for (const item of pendingSync) {
        log(`Syncing item: ${item.id}`);
        const isSuccess = await changeUserStatus(item.user_id, item.event_id, item.progressionStatus, token);
        if (isSuccess) {
          item.isSync = 0;
          await mydb.updateUser(item);
        } else {
          Alert.alert('Error in syncing Data');
          return;
        }
      }
      setPendingSync([]);
      log('Data sync completed successfully.');
    } catch (error) {
      logError('Error syncing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Syncing data...</Text>
        </View>
      ) : (
        <View style={{width:'70%', justifyContent:'center', alignItems:'center'}}>
        <View style={styles.logOutBtn}>
          <Image source={require('../assets/majesticons_logout.png')} style={{width:60,height:60}} />
        </View>
          <Text style={styles.heading}>You sure wants to logout?</Text>
          <Text style={styles.content}>
          If you choose to logout, your event data will be deleted and you will have to add events again.
          </Text>
          {pendingSync && pendingSync.length > 0 &&(
            <TouchableOpacity style={styles.syncButton} onPress={syncData}>
              <Text style={styles.buttonText}>Sync Data</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleTabPress}>
            <Text style={styles.buttonText}>Yes, Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.logoutButton,{backgroundColor:colors.secondary}]} onPress={() => navigation.navigate('Events') }>
            <Text style={[styles.buttonText,{color:colors.primary}]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal:20,
    backgroundColor:colors.whiteColor,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontFamily:'Urbanist-bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
    marginTop:32
  },
  content: {
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
   width:'65%',
   fontFamily:'Urbanist-regular'
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  exportButton: {
    backgroundColor: '#66cccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  syncButton: {
    backgroundColor: '#66cc66',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    // fontWeight: 'bold',
    fontFamily:"Urbanist-bold"
  },
  logOutBtn:{
    backgroundColor:colors.secondary,
    width:90,
    height:90,
    borderRadius:50,
    justifyContent:'center',
    alignItems:'center'
  }
});

export default DatabaseExporter;

