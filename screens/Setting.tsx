import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal, Alert, Linking } from 'react-native';
import { getToken } from '../apis/authApi';
import StorageHelper from '../utils/storageHelper';
import videoThumbnail from '../assets/4163020.jpg';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import strings from '../utils/strings';
import colors from '../utils/colors';
import dimen from '../utils/dimen';
import { log, logError } from '../utils/logger';



const Setting: React.FC = () => {
    const [endPointUrl, setEndPointUrl] = useState<string>('');
    const [clientId, setClientId] = useState<string>('');
    const [clientSecret, setClientSecret] = useState<string>('');
    const [showLoadingDialog, setShowLoadingDialog] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

    useEffect(() => {
        setInitialValue()
    }, [])

    const setInitialValue = async () => {
        const endPointUrl = await StorageHelper.getItem('endPointUrl');
        const clientId = await StorageHelper.getItem('clientId');
        const clientSecret = await StorageHelper.getItem('clientSecret');
        setEndPointUrl(endPointUrl);
        setClientId(clientId);
        setClientSecret(clientSecret);
    }

    const checkInternetConnection = async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            Alert.alert(strings.noInternet, strings.checkInternet);
            return false;
        }
        return true;
    };

    const checkToken = async () => {
        try {
            setMessage(strings.loading);
            setShowLoadingDialog(true);
            const storedToken = await StorageHelper.isTokenValid();
            setIsButtonDisabled(storedToken);
        } catch (error) {
            logError('Failed to check token', error);
        } finally {
            setShowLoadingDialog(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkToken();
        }, [])
    );

    const handleConnect = async () => {
        if (!endPointUrl || !clientId || !clientSecret) {
            setMessage(strings.allFieldsRequired);
            return;
        }

        const isConnected = await checkInternetConnection();
        console.log('isConnected', isConnected)
        if (!isConnected) return;

        try {
            setShowLoadingDialog(true);
            setMessage(strings.connecting);
            const tokenData = await getToken(endPointUrl, clientId, clientSecret);
            if (!tokenData || !tokenData.access_token) {
                throw new Error('Invalid response from server');
            }
            const { access_token, expires_in } = tokenData;
            const expiryTime = Date.now() + expires_in * 1000;
            await StorageHelper.saveItem('endPointUrl', endPointUrl);
            await StorageHelper.saveItem('clientId', clientId);
            await StorageHelper.saveItem('clientSecret', clientSecret);
            await StorageHelper.saveItem('token', access_token);
            await StorageHelper.saveItem('expiryTime', expiryTime.toString());
            setMessage(strings.connectedSuccessfully);
        } catch (error) {
            logError('Failed to connect', error);
            setMessage(strings.connectionFailed);
        } finally {
            checkToken();
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLoadingDialog}
                onRequestClose={() => setShowLoadingDialog(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.loadingDialog}>
                        <ActivityIndicator size="large" color={colors.indicator} />
                        <Text style={styles.loadingMessage}>{message}</Text>
                    </View>
                </View>
            </Modal>

            <>
                <View style={{ marginTop: 40 }}>
                </View>
                <View style={{ width: '70%' }}>
                    <Text style={styles.title}>{strings.settingTitle}</Text>

                </View>
                <View style={styles.subtitleContainerMain}>
                    <View style={{ backgroundColor: colors.primary, borderRadius: 20, }}>
                        <Image source={require('../assets/play.png')} style={styles.playBtn} />

                    </View>
                    <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/Gaf_jCnA6mc')}>
                        <Text style={styles.subtitle}>{strings.settingVideoTitle}</Text>

                    </TouchableOpacity>

                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>{strings.endPointUrlLable}</Text>
                    <View
                        style={styles.input}

                    >
                        <Image source={require('../assets/mingcute_link-line.png')} style={{ width: 16, height: 16 }} />

                        <TextInput
                            placeholder={strings.endPointUrl}
                            value={endPointUrl}
                            onChangeText={setEndPointUrl}
                            style={{ width: '90%' }}
                            placeholderTextColor={colors.grayScale4}

                        />
                    </View>

                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>{strings.clientIdLable}</Text>
                    <View style={styles.input}>

                        <Image source={require('../assets/solar_user-id-bold.png')} style={{ width: 16, height: 16 }} />

                        <TextInput
                            placeholder={strings.clientId}
                            style={{ width: '90%' }}
                            value={clientId}
                            onChangeText={setClientId}
                            placeholderTextColor={colors.grayScale4}
                        />
                    </View>

                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>{strings.clientSecretLable}</Text>
                    <View style={styles.input}>
                        <Image source={require('../assets/ri_key-fill.png')} style={{ width: 16, height: 16 }} />


                        <TextInput
                            style={{ width: '90%' }}
                            placeholder={strings.clientSecret}
                            value={clientSecret}
                            onChangeText={setClientSecret}
                            secureTextEntry
                            placeholderTextColor={colors.grayScale4}
                        />
                    </View>
                    <View style={styles.button}>
                        {isButtonDisabled ? (
                            <Text style={styles.connectedText}>{strings.connected}</Text>
                        ) : (
                            <TouchableOpacity onPress={handleConnect} >
                                <Text style={styles.buttonText}>{strings.connectButton}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

            </>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.overlayBgColor,
        borderRadius: dimen.cornerRadiusL
    },


    loadingDialog: {
        backgroundColor: colors.whiteColor,
        padding: 20,
        borderRadius: dimen.cornerRadiusL,
        alignItems: 'center',
    },
    loadingMessage: {
        marginTop: 10,
        fontSize: dimen.textSize,
        color: colors.textColor,
    },
    videoThumbnail: {
        width: '70%',
        height: 200,
        marginBottom: 20,
        borderRadius: dimen.cornerRadiusL
    },
    title: {
        fontSize: 24,
        // fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Urbanist-bold',
        marginBottom: 10,
        color: colors.headerTextColor,
    },
    subtitle: {
        fontSize: dimen.textSizeS,
        color: colors.linkColor,
        fontFamily: 'Urbanist-regular'


    },
    inputContainer: {
        marginBottom: 15,
        marginHorizontal: 20,
        width: '75%',

    },
    inputHeading: {
        marginBottom: 5,
        fontSize: dimen.textSize,
        color: colors.textFieldLableColor,
        fontFamily: 'Urbanist-semi'
    },
    input: {
        width: '100%',
        height: 60,
        borderColor: colors.darkBorderColor,
        borderWidth: 1,
        borderRadius: dimen.cornerRadiusS,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.whiteColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 35,
        borderRadius: dimen.cornerRadiusS,
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        justifyContent: 'center',
        marginTop: 25
    },
    buttonText: {
        color: colors.whiteColor,
        fontSize: dimen.textSize,
    },
    connectedText: {
        fontSize: dimen.textSize,
        fontWeight: 'bold',
        color: colors.whiteColor,
        // backgroundColor: colors.successBg,
        // paddingVertical: 15,
        // paddingHorizontal: 35,

        // borderRadius: dimen.cornerRadiusS,
        // alignSelf:'center'
    },
    subtitleContainerMain: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 15,
        marginBottom: 55,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        flexDirection: 'row',
        gap: 6,
        borderColor: '#B0D5FF'
    },
    playBtn: {
        width: 20,
        height: 20
    }
});

export default Setting;


// import React, { useCallback, useEffect, useState } from 'react';
// import {
//     View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal, Alert, Linking
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import NetInfo from '@react-native-community/netinfo';
// import { getToken } from '../apis/authApi';
// import StorageHelper from '../utils/storageHelper';
// import strings from '../utils/strings';
// import colors from '../utils/colors';
// import dimen from '../utils/dimen';
// import { log, logError } from '../utils/logger';

// const Setting: React.FC = () => {
//     const [endPointUrl, setEndPointUrl] = useState(strings.endPointUrl);
//     const [clientId, setClientId] = useState(strings.clientId);
//     const [clientSecret, setClientSecret] = useState(strings.clientSecret);
//     const [showLoadingDialog, setShowLoadingDialog] = useState(false);
//     const [message, setMessage] = useState('');
//     const [isButtonDisabled, setIsButtonDisabled] = useState(false);

//     /** ✅ Check Internet Connection */
//     const checkInternetConnection = async (): Promise<boolean> => {
//         const state = await NetInfo.fetch();
//         if (!state.isConnected) {
//             Alert.alert(strings.noInternet, strings.checkInternet);
//             return false;
//         }
//         return true;
//     };

//     /** ✅ Check Token Validity */
//     const checkToken = async () => {
//         try {
//             setShowLoadingDialog(true);
//             setMessage(strings.loading);
//             const storedToken = await StorageHelper.isTokenValid();
//             setIsButtonDisabled(storedToken);
//         } catch (error) {
//             logError('Failed to check token', error);
//         } finally {
//             setShowLoadingDialog(false);
//         }
//     };

//     /** ✅ Load Token When Screen Focuses */
//     useFocusEffect(
//         useCallback(() => {
//             checkToken();
//         }, [])
//     );

//     /** ✅ Handle API Connection */
//     const handleConnect = async () => {
//         if (!endPointUrl || !clientId || !clientSecret) {
//             Alert.alert(strings.error, strings.allFieldsRequired);
//             return;
//         }

//         const isConnected = await checkInternetConnection();
//         if (!isConnected) return;

//         try {
//             setShowLoadingDialog(true);
//             setMessage(strings.connecting);

//             const tokenData = await getToken(endPointUrl, clientId, clientSecret);
//             if (!tokenData || !tokenData.access_token) {
//                 throw new Error(strings.invalidServerResponse);
//             }

//             const { access_token, expires_in } = tokenData;
//             const expiryTime = Date.now() + expires_in * 1000;

//             await StorageHelper.saveItem('token', access_token);
//             await StorageHelper.saveItem('expiryTime', expiryTime.toString());

//             setMessage(strings.connectedSuccessfully);
//         } catch (error) {
//             logError('Failed to connect', error);
//             Alert.alert(strings.connectionFailed, error.message);
//             setMessage(strings.connectionFailed);
//         } finally {
//             setShowLoadingDialog(false);
//             checkToken();
//         }
//     };

//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             {/** ✅ Loading Modal */}
//             <Modal
//                 animationType="fade"
//                 transparent
//                 visible={showLoadingDialog}
//                 onRequestClose={() => setShowLoadingDialog(false)}
//             >
//                 <View style={styles.modalContainer}>
//                     <View style={styles.loadingDialog}>
//                         <ActivityIndicator size="large" color={colors.indicator} />
//                         <Text style={styles.loadingMessage}>{message}</Text>
//                     </View>
//                 </View>
//             </Modal>

//             {/** ✅ Page Title */}
//             <Text style={styles.title}>{strings.settingTitle}</Text>

//             {/** ✅ Help Video Section */}
//             <View style={styles.subtitleContainerMain}>
//                 <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/Gaf_jCnA6mc')}>
//                     <Image source={require('../assets/play.png')} style={styles.playBtn} />
//                     <Text style={styles.subtitle}>{strings.settingVideoTitle}</Text>
//                 </TouchableOpacity>
//             </View>

//             {/** ✅ Input Fields */}
//             <View style={styles.inputContainer}>
//                 <Text style={styles.inputHeading}>{strings.endPointUrlLable}</Text>
//                 <View style={styles.input}>
//                     <Image source={require('../assets/mingcute_link-line.png')} style={styles.icon} />
//                     <TextInput
//                         value={endPointUrl}
//                         onChangeText={setEndPointUrl}
//                         style={styles.inputField}
//                         placeholderTextColor="grey"
//                     />
//                 </View>
//             </View>

//             <View style={styles.inputContainer}>
//                 <Text style={styles.inputHeading}>{strings.clientIdLable}</Text>
//                 <View style={styles.input}>
//                     <Image source={require('../assets/solar_user-id-bold.png')} style={styles.icon} />
//                     <TextInput
//                         value={clientId}
//                         onChangeText={setClientId}
//                         style={styles.inputField}
//                         placeholderTextColor="grey"
//                     />
//                 </View>
//             </View>

//             <View style={styles.inputContainer}>
//                 <Text style={styles.inputHeading}>{strings.clientSecretLable}</Text>
//                 <View style={styles.input}>
//                     <Image source={require('../assets/ri_key-fill.png')} style={styles.icon} />
//                     <TextInput
//                         value={clientSecret}
//                         onChangeText={setClientSecret}
//                         style={styles.inputField}
//                         secureTextEntry
//                         placeholderTextColor="grey"
//                     />
//                 </View>
//             </View>

//             {/** ✅ Connect Button */}
//             <View style={styles.button}>
//                 {isButtonDisabled ? (
//                     <Text style={styles.connectedText}>{strings.connected}</Text>
//                 ) : (
//                     <TouchableOpacity onPress={handleConnect}>
//                         <Text style={styles.buttonText}>{strings.connectButton}</Text>
//                     </TouchableOpacity>
//                 )}
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//         padding: 20,
//         backgroundColor: colors.whiteColor,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     modalContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: colors.overlayBgColor,
//     },
//     loadingDialog: {
//         backgroundColor: colors.whiteColor,
//         padding: 20,
//         borderRadius: dimen.cornerRadiusL,
//         alignItems: 'center',
//     },
//     loadingMessage: {
//         marginTop: 10,
//         fontSize: dimen.textSize,
//         color: colors.textColor,
//     },
//     title: {
//         fontSize: 24,
//         textAlign: 'center',
//         fontFamily: 'Urbanist-bold',
//         marginBottom: 20,
//         color: colors.headerTextColor,
//     },
//     subtitleContainerMain: {
//         alignItems: 'center',
//         flexDirection: 'row',
//         gap: 6,
//         marginBottom: 20,
//     },
//     playBtn: {
//         width: 20,
//         height: 20
//     },
//     inputContainer: {
//         marginBottom: 15,
//         width: '100%',
//     },
//     inputHeading: {
//         marginBottom: 5,
//         fontSize: dimen.textSize,
//         color: colors.textFieldLableColor,
//         fontFamily: 'Urbanist-semi'
//     },
//     input: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderRadius: dimen.cornerRadiusS,
//         padding: 10,
//     },
//     inputField: {
//         flex: 1,
//         marginLeft: 10,
//     },
//     icon: {
//         width: 16,
//         height: 16
//     },
//     button: {
//         backgroundColor: colors.primary,
//         padding: 15,
//         borderRadius: dimen.cornerRadiusS,
//         alignItems: 'center',
//         marginTop: 20,
//     },
//     buttonText: {
//         color: colors.whiteColor,
//         fontSize: dimen.textSize,
//     },
// });

// export default Setting;
