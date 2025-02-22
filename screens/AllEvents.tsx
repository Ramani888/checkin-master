import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    FlatList,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { fetchEventAndUsersData } from '../apis/eventApi';
import StorageHelper from '../utils/storageHelper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import mydb from '../database/mydb';
import eventImage from '../assets/event.jpg';
import NetInfo from '@react-native-community/netinfo';
import strings from '../utils/strings';
import colors from '../utils/colors';
import dimen from '../utils/dimen';
import { log, logError } from '../utils/logger';
import { Ionicons } from '@expo/vector-icons';
import { changeUserStatus } from '../apis/mapToEvent';
import { WebView } from 'react-native-webview';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';




const AllEvents: React.FC<any> = ({ navigation }) => {
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [eventName, setEventName] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [pendingSync, setPendingSync] = useState([]);

    const checkInternetConnectivity = async () => {
        const netInfoState = await NetInfo.fetch();
        return netInfoState.isConnected;
    };

    const checkToken = async () => {
        setMessage(strings.loading);
        setLoading(true);
        const storedToken = await StorageHelper.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    };

    const fetchEvents = async () => {
        try {
            setMessage(strings.loadingEvents);
            const results = Array.from(await mydb.getAllEvents());

            log('Fetched events:', results);

            if (results && results.length > 0) {
                setEvents(results);
            } else {
                log('No events found in the database');
            }
        } catch (error) {
            logError('Failed to fetch events', error);
        }
        setLoading(false);
    };

    const fetchPendingSyncCount = async () => {
        try {
            const count = await mydb.getPendingSyncCount();
            setPendingSync(count);
        } catch (error) {
            logError('Error fetching pending sync count:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setLoading(true);
                setTimeout(async () => {
                    await checkToken();
                    await fetchEvents();
                    setLoading(false);
                    await fetchPendingSyncCount()
                }, 100);
            };
            loadData();
        }, [])
    );

    const handleAddEvent = async () => {

        eventName && setIsAddingEvent(false)
        const isConnected = await checkInternetConnectivity();
        if (!isConnected) {
            Alert.alert(strings.noInternet);
            return
        }
        if (!eventName) {
            Alert.alert(strings.eventCannotBeBlank);
            return;
        }
        if (events.some(event => event.id == eventName)) {
            Alert.alert(strings.eventAlreadyAdded);
            return;
        }
        try {
            setLoading(true);
            setMessage(strings.eventAdding);
            const eventData = await fetchEventAndUsersData(eventName, token);
            log('eventData:', eventData);

            if (!eventData) {
                Alert.alert(strings.noEventFound);
                return;
            }
            setEventName('');
            setIsAddingEvent(false);
            fetchEvents();
            setMessage(strings.eventAddSuccess);
        } catch (error) {
            logError('Failed to add event', error);
            Alert.alert(strings.addEventfailed);
        } finally {
            setLoading(false);
        }
    };

    const handleEventPress = (event: any) => {
        log('Clicked Event:', event);
        setLoading(false);
        navigation.navigate('EventDetails', { eventData: event });
    };

    const handleLongPress = (item: any) => {
        Alert.alert(
            'Remove Event',
            `Are you sure you want to remove the event "${item.name}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    onPress: async () => {
                        const res = await mydb.deleteEvent(item.id);
                        if (res === true) {
                            setEvents(events.filter(event => event.id !== item.id));
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const formatDate = (dateString: string) => {
        const options = { day: 'numeric', month: 'short' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options);
    };

    const handleSync = async () => {
        const isConnected = await checkInternetConnectivity();
        if (!isConnected) {
            Alert.alert(strings.noInternet);
            return
        }
        setLoading(true);
        setMessage("Syncing Data")
        try {
            for (const item of pendingSync) {
                log(`Syncing item: ${item.id}`);
                const isSuccess = await changeUserStatus(item.user_id, item.event_id, item.progressionStatus, token)
                if (isSuccess) {
                    item.isSync = 0
                    await mydb.updateUser(item);
                }
                else {
                    Alert.alert("Error in syncing Data")
                    return
                }
            }
            Alert.alert("Sync Completed")
            setPendingSync([]);
            log('Data sync completed successfully.');
        } catch (error) {
            logError('Error syncing data:', error);
        } finally {
            setLoading(false);
        }
    };

    // console.log(events)
    return (
        <View style={styles.container}>
            <View style={styles.sidebar}>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ borderWidth: 1, borderColor: '#DFE5EC', width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 15 }}>
                        <AntDesign name="arrowleft" size={24} color="#55A5FF" />

                    </TouchableOpacity>
                    <Text style={styles.sidebarTitle}>Events</Text>
                    <View />
                </View>
                {events.length === 0 ? (
                    <View style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={{ backgroundColor: "", }} showsVerticalScrollIndicator={false} >
                            <View style={styles.noEventsContainer}>
                                <View style={styles.videoContainer}>
                                    <View style={styles.crossContainer}>
                                        <Image source={require('../assets/cross.png')} style={{ width: 62, height: 62 }} />
                                    </View>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 28 }}>No Schedule Events at the moment</Text>
                                    <Text style={{ fontSize: 16, color: '#345C89', marginBottom: 56 }}>It takes juts a minute to add a new event</Text>


                                    <View style={styles.addButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {

                                                setIsAddingEvent(true);
                                            }}
                                        >
                                            <Text style={[styles.buttonText, { color: '#0179FF' }]}>{strings.addEvent}</Text>
                                        </TouchableOpacity>
                                        <View style={{ width: '85%' }}>
                                            <Text style={{ color: '#01244D', fontSize: 32, textAlign: 'center', fontWeight: '700', marginBottom: 27 }}>Need help in adding a new event?
                                                Watch the video and lets do it</Text>
                                        </View>

                                        <View style={{ height: 250 }}>
                                            <WebView
                                                source={{ uri: strings.videoUrlAllEvents }}
                                                style={styles.videoThumbnail}
                                            />
                                        </View>


                                    </View>

                                </View>


                            </View>
                        </ScrollView>
                    </View>
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleEventPress(item)}
                                onLongPress={() => handleLongPress(item)}
                            >
                                <View style={styles.eventItem}>
                                    <View style={styles.overlay}></View>
                                    <Text style={styles.eventName}>{item.name}</Text>
                                    <View style={styles.eventDetails}>
                                        <Text style={styles.eventDate}>{formatDate(item.startDate)}</Text>
                                        <Text style={styles.eventMembers}>Members: {item.users.length}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}

            </View>
            <View style={{}}>
                {isAddingEvent ? (
                    <View style={styles.addEventContainer}>

                        <TouchableOpacity onPress={() => setIsAddingEvent(false)} style={{ backgroundColor: '#E6F2FF', width: 64, height: 64, justifyContent: 'center', alignItems: 'center', borderRadius: 30, alignSelf: 'flex-end', marginBottom: 20 }}>
                            <Entypo name="cross" size={24} color="black" />
                        </TouchableOpacity>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.heading}>{strings.addEvent}</Text>
                            <Text style={{ marginBottom: 40 }}>{'Enter your event Details'}</Text>

                        </View>
                        <Text style={styles.eventIdHeading}>{strings.eventId}</Text>
                        <View style={styles.input}>
                            <TextInput
                                placeholder='Enter Event ID'
                                placeholderTextColor={colors.grayScale4}
                                style={{ flex: 1, paddingHorizontal: 20 }}
                                value={eventName}
                                onChangeText={setEventName}
                            />
                        </View>

                        <TouchableOpacity style={styles.addEventButton} onPress={handleAddEvent}>
                            <Text style={styles.buttonText}>{'Add Event'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsAddingEvent(false)} style={styles.cancelButton}>
                            <Text style={{ color: '#697F96', fontSize: 20 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View >
                        {/* <WebView
              source={{ uri: strings.videoUrlAllEvents }}
              style={styles.videoThumbnail}
            /> */}

                    </View>
                )}
            </View>
            {
                pendingSync != null && pendingSync.length > 0 && (
                    <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
                        <View style={styles.syncButtonContent}>
                            <Ionicons name='sync' color={colors.whiteColor} size={18} />
                            <Text style={styles.syncButtonText}>Sync</Text>
                        </View>
                    </TouchableOpacity>
                )
            }
            <Modal
                animationType="fade"
                transparent={true}
                visible={loading}
                onRequestClose={() => setLoading(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.loadingDialog}>
                        <ActivityIndicator size="large" color={colors.indicator} />
                        <Text style={styles.loadingMessage}>{message}</Text>
                    </View>
                </View>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // flexDirection: 'row',
    },
    sidebar: {
        flex: 1,
        // backgroundColor:colors.whiteColor,
        // paddingHorizontal: 10,
        // paddingVertical: 30,
        justifyContent: 'space-between',

    },
    sidebarTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "#01244D",
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 10,
        marginRight: 50
    },
    noEventsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    noEventsText: {
        fontSize: dimen.size20,
        fontWeight: 'bold',
        color: colors.textColor,
        textAlign: 'left',
        marginBottom: 10,
        marginHorizontal: 15,
    },
    noEventsSubtext: {
        fontSize: dimen.textSizeS,
        color: colors.textColor,
        textAlign: 'left',
        marginBottom: 20,
        marginHorizontal: 10,
    },
    eventItem: {
        borderRadius: dimen.cornerRadiusS,
        paddingStart: 10,
        paddingEnd: 10,
        paddingVertical: 10,
        width: '100%',
        position: 'relative',
        borderColor: colors.whiteColor,
        borderTopWidth: 2,
        borderBottomWidth: 2,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: dimen.cornerRadiusS,
    },
    eventName: {
        fontSize: dimen.textSize,
        fontWeight: 'bold',
        marginBottom: 5,
        color: colors.textColor,
    },
    eventDetails: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventDate: {
        fontSize: dimen.textSizeS,
        marginBottom: 5,
        color: colors.textColor,
    },
    eventMembers: {
        fontSize: dimen.textSizeS,
        color: colors.textColor,
    },
    addButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,

    },
    button: {
        backgroundColor: colors.whiteColor,

        borderColor: '#0179FF',
        borderWidth: 1,
        borderRadius: 7,
        width: 330,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: dimen.textSize,

    },
    // content: {
    //   flex: 1,
    //   padding:10,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   backgroundColor: colors.whiteColor,
    // },
    videoContainer: {
        width: '100%',
        height: '100%',
        // marginTop: -200,
        backgroundColor: '#F1F4F6',
        padding: 30,
        borderRadius: dimen.cornerRadiusL,
        justifyContent: 'center',
        alignItems: 'center'
        // marginHorizontal: 20,
    },
    crossContainer: {
        width: 124,
        height: 124,
        borderRadius: 100,
        backgroundColor: colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        marginTop: 32
    },
    videoThumbnail: {
        width: 400,
        height: 10,
        marginBottom: 10,
        alignSelf: 'center',
        borderRadius: dimen.cornerRadiusS,
    },
    videoTitle: {
        fontSize: dimen.size20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'left',
        color: colors.textColor,
    },
    videoSubtext: {
        fontSize: dimen.textSizeS,
        color: colors.linkColor,
    },
    addEventContainer: {
        justifyContent: 'center',
        width: '80%',
        // height: 623,
        backgroundColor: colors.whiteColor,
        padding: 20,
        borderRadius: dimen.cornerRadiusL,
        marginHorizontal: 60,
        alignSelf: 'center',
        marginBottom: 120,
        alignItems: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.overlayBgColor,
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
    addEventButton: {
        backgroundColor: colors.primary,
        borderRadius: dimen.cornerRadiusS,
        alignSelf: 'center',
        alignItems: 'center',
        height: 65,
        width: '100%',
        marginTop: 25,
        justifyContent: 'center'

    },
    cancelButton: {
        backgroundColor: '#E6F2FF',
        borderRadius: dimen.cornerRadiusS,
        alignSelf: 'center',
        alignItems: 'center',
        height: 65,
        width: '100%',
        marginTop: 15,
        justifyContent: 'center'

    },
    heading: {
        fontSize: dimen.heading,
        fontWeight: 'bold',
        marginBottom: 19,
    },
    eventIdHeading: {
        alignSelf: 'flex-start',
        padding: 5,
        color: colors.headerTextColor,
    },
    input: {
        width: '100%',

        height: 69,
        borderColor: colors.darkBorderColor,
        borderWidth: 1,
        borderRadius: dimen.cornerRadiusS,
        // paddingHorizontal: 10,
        // marginBottom: 10,
    },
    troubleshootingText: {
        marginTop: 50,
        fontWeight: 'bold',
        fontSize: dimen.bigHeading,
        color: colors.textColor,
    },
    troubleshootingText2: {
        marginTop: 5,
        color: colors.linkColor,
    },

    syncButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: colors.secondary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncButtonText: {
        color: colors.whiteColor,
        fontSize: dimen.textSizeS,
        marginLeft: 5,
    },
});

export default AllEvents;
