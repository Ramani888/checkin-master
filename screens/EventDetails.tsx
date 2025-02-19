import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { createOrUpdateUser } from '../apis/addEditUserApi';
import StorageHelper from '../utils/storageHelper';
import { changeUserStatus } from '../apis/mapToEvent';
import mydb from '../database/mydb';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import strings from '../utils/strings';
import NetInfo from '@react-native-community/netinfo';
import colors from '../utils/colors';
import dimen from '../utils/dimen';
import React from 'react';
import { log, logError } from '../utils/logger';
import EvilIcons from '@expo/vector-icons/EvilIcons';


interface Props {
    route: {
        params: {
            eventData: {
                name: string;
                id: number;
                users: {
                    user_id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    company: string;
                    phone: string;
                    unsubscribed: number;
                    progressionStatus: string;
                }[];
                workspace: string;
            };
        };
    };
    navigation: any;
}

interface User {
    user_id: number;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    unsubscribed: number;
    progressionStatus: string;
    isSync: number;
}

const EventDetails: React.FC<Props> = ({ route, navigation }) => {
    const { eventData } = route.params;
    const [users, setUsers] = useState<User[]>(eventData.users || []);
    const [token, setToken] = useState<string>('');
    const [newUser, setNewUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const checkInternetConnection = async () => {
        const state = await NetInfo.fetch();
        return state.isConnected;
    };


    useEffect(() => {
        const checkToken = async () => {
            try {
                const storedToken = await StorageHelper.getItem('token');
                log("token: ", storedToken);
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (error) {
                error('Failed to retrieve token:', error);
            }
        };

        checkToken();
    }, []);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const onSaveuser = async () => {
        try {
            const isConnected = await checkInternetConnection();
            if (!isConnected) {
                Alert.alert(strings.noInternet, strings.checkInternet);
                return
            }
            setIsLoading(true);
            setLoadingMessage(isEditing ? strings.updatingUser : strings.addingUser);
            if (!newUser.firstName || !newUser.lastName || !newUser.email) {
                alert(strings.allFieldsRequired);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newUser.email)) {
                alert(strings.enterValidEmail);
                return;
            }
            const response = await createOrUpdateUser(newUser, token, eventData.workspace);
            log(response);
            if (response && response.success === true) {
                if (isEditing && newUser) {
                    const updatedUsers = users.map(user => user.user_id === newUser.user_id ? newUser : user);
                    setFilteredUsers(updatedUsers);
                    mydb.updateUser(newUser);
                    alert(strings.userUpdatedSuccess);

                } else {
                    await handleAddUserResponse(response)
                    alert(strings.userSavedSuccess);
                }
                setIsEditing(false);
                setIsAdding(false)
                setNewUser(null)
            } else {
                log("Error", "Failed to add or update the user. Please try again.");
            }
        } catch (error) {
            error('Failed to add or update user:', error);
            log("Error", "Failed to add or update the user. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUserResponse = async (response) => {
        try {
            const id = response.result[0]?.id;
            const status = response.result[0]?.status;

            if (id && status) {
                log("userId", id);
                const updatedUser = { ...newUser, user_id: id };

                const saveToDBSuccess = await mydb.createUser(updatedUser, eventData.id);
                if (!saveToDBSuccess) {
                    alert(strings.savingUserFailed);
                    return
                }
                setFilteredUsers([...filteredUsers, updatedUser]);
                setUsers(prevUsers => [...prevUsers, updatedUser]);

                const isSuccess = await changeUserStatus(id, eventData.id, "Registered", token);
                if (!isSuccess)
                    Alert.alert("Unable to update user status")

            } else {
                throw new Error("No ID found in the response.");
            }
        } catch (error) {
            error("Error processing user:", error);
        }
    }
    const handleCheckInOut = async () => {
        try {
            const isConnected = await checkInternetConnection();
            setIsLoading(true);
            setLoadingMessage('Checking In User...');

            if (newUser) {
                if (isConnected) {
                    log("Selected User: ", newUser);
                    const response = await changeUserStatus(newUser.user_id, eventData.id, "Attended", token);
                    log("Change User Status Response: ", response);
                    if (response == true) {
                        newUser.progressionStatus = "Attended";
                        log("Change User Status Response: ", newUser);
                    }
                }
                else {
                    newUser.progressionStatus = "Attended";
                    newUser.isSync = 1
                }
                const updatedUsers = users.map(user => user.user_id === newUser.user_id ? newUser : user);
                log("updated user: ", updatedUsers);
                setFilteredUsers(updatedUsers);
                mydb.updateUser(newUser);

            }
        } catch (error) {
            error('Failed to check in user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setIsEditing(true);
        setIsAdding(false)
    };
    const onUserClicked = (user) => {
        log("user clicked  : ", user.firstName + user.lastName + " pState ", user.progressionStatus)
        setIsEditing(false)
        setIsAdding(false)
        setNewUser({
            user_id: user.user_id,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company,
            email: user.email,
            phone: user.phone,
            unsubscribed: user.unsubscribed,
            progressionStatus: user.progressionStatus,
            isSync: user.isSync ?? 0
        });

    }

    const addUserClicked = () => {
        setNewUser({
            user_id: 0,
            firstName: '',
            lastName: '',
            company: '',
            email: '',
            phone: '',
            unsubscribed: 0,
            progressionStatus: "Registered",
            isSync: 0
        });
        setIsEditing(false);
        setIsAdding(true)
    };
    const handlePhoneChange = (text) => {
        const phoneNumber = text.replace(/[^0-9]/g, '').slice(0, 10);
        setNewUser({ ...newUser, phone: phoneNumber });
    };

    const groupUsersAlphabetically = () => {
        const groupedUsers: { [key: string]: User[] } = {};
        filteredUsers.forEach((user) => {
            const firstLetter = user.firstName.charAt(0).toUpperCase();
            if (!groupedUsers[firstLetter]) {
                groupedUsers[firstLetter] = [];
            }
            groupedUsers[firstLetter].push(user);
        });

        const sortedKeys = Object.keys(groupedUsers).sort();

        sortedKeys.forEach(key => {
            groupedUsers[key].sort((a, b) => {
                const fullNameA = `${a.firstName} ${a.lastName}`.toUpperCase();
                const fullNameB = `${b.firstName} ${b.lastName}`.toUpperCase();
                if (fullNameA < fullNameB) {
                    return -1;
                }
                if (fullNameA > fullNameB) {
                    return 1;
                }
                return 0;
            });
        });

        return sortedKeys.map((key) => ({
            letter: key,
            data: groupedUsers[key],
        }));
    };


    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim().length === 0) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(query.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.leftPanel}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                    <Ionicons name="arrow-back-sharp" size={20} color="#0179FF" style={styles.icon} />
                    <Text style={styles.eventName}>Events</Text>
                </TouchableOpacity>
                <View style={styles.searchInput}>
                    <View style={{}}>
                        <EvilIcons name="search" size={24} color="black" />

                    </View>
                    <TextInput
                        style={{ fontSize: 12 }}
                        placeholder="Search for any event here"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>


                <FlatList
                    data={groupUsersAlphabetically()}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <>
                            <Text style={styles.sectionHeader}>{item.letter}</Text>
                            {item.data.map((user) => (
                                <TouchableOpacity key={user.user_id} onPress={() => onUserClicked(user)} >
                                    <View style={[styles.userItem, newUser != null && user.user_id === newUser.user_id && { backgroundColor: colors.whiteColor }]} >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {user.progressionStatus === 'Attended' ? (
                                                <Ionicons name='checkmark' style={styles.itemIconStyle} />
                                            ) : (
                                                <View style={styles.space} />
                                            )}
                                            <View style={{ flex: 1, backgroundColor: '#F1F4F6', height: 94, width: '100%', paddingHorizontal: 20, paddingVertical: 17, borderRadius: 6 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.textColor, marginBottom: 12 }}>{user.firstName} {user.lastName}</Text>
                                                <Text style={{ fontSize: 13, color: colors.textColor }}>{user.company}</Text>
                                            </View>

                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                />
                <TouchableOpacity onPress={addUserClicked} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add Attendee</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.rightPanel}>
                {newUser && (
                    <View style={styles.userDetailsContainer}>
                        <View style={[styles.userDetailRow,]}>
                            <Text style={styles.userDetailsTitle}>{isAdding ? strings.addAtendee : isEditing ? strings.editAtendee : strings.atendeeDetails}</Text>
                            {isEditing || isAdding ? null : (
                                <Ionicons style={styles.editIconStyle} name="pencil" onPress={() => handleEditUser(newUser)}></Ionicons>
                            )}
                        </View>
                        <View style={styles.userDetailRow}>
                            <View>

                                <Text style={styles.label}>First Name:</Text>
                                <View style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}>
                                    <Image source={require('../assets/usss.png')} style={{ width: 20, height: 20 }} />
                                    <TextInput
                                        style={{}}
                                        placeholder="First Name"
                                        value={newUser.firstName}
                                        editable={isEditing || isAdding}
                                        onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
                                    />
                                </View>
                            </View>
                            <View>
                                <Text style={styles.label}>Last Name:</Text>
                                <View style={[styles.input, !isEditing && !isAdding && styles.disabledInput]} >
                                    <Image source={require('../assets/usss.png')} style={{ width: 20, height: 20 }} />

                                    <TextInput

                                        placeholder="Last Name"
                                        value={newUser.lastName}
                                        editable={isEditing || isAdding}
                                        onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.userDetailRow}>
                            <View>
                                <Text style={styles.label}>Email:</Text>
                                <View style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}>
                                    <Image source={require('../assets/maill.png')} style={{ width: 20, height: 20 }} />

                                    <TextInput

                                        placeholder="Email"
                                        value={newUser.email}
                                        editable={isEditing || isAdding}
                                        onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                                    />
                                </View>
                            </View>
                            <View>
                                <Text style={styles.label}>Company:</Text>
                                <View style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}>
                                    <Image source={require('../assets/comp.png')} style={{ width: 20, height: 20 }} />

                                    <TextInput
                                        placeholder="Organization"
                                        value={newUser.company}
                                        editable={isEditing || isAdding}
                                        onChangeText={(text) => setNewUser({ ...newUser, company: text })}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.userDetailRow}>
                            <View>
                                <Text style={styles.label}>Phone:</Text>
                                <View style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}>
                                    <Image source={require('../assets/usss.png')} style={{ width: 20, height: 20 }} />

                                    <TextInput

                                        placeholder="Phone"
                                        value={newUser.phone}
                                        onChangeText={handlePhoneChange}
                                        maxLength={10}
                                        editable={isEditing || isAdding}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{ backgroundColor: colors.whiteColor, paddingHorizontal: 20, marginBottom: 24 }}>
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Marketing Opted In</Text>
                                <Switch
                                    trackColor={{ false: 'white', true: '#17DF37' }}
                                    value={newUser.unsubscribed === 0}
                                    onValueChange={(value) => setNewUser({ ...newUser, unsubscribed: value ? 0 : 1 })}
                                    disabled={!isEditing && !isAdding}

                                />
                            </View>
                            <Text style={styles.privacyText}>{strings.privacyTextAddUser}</Text>

                        </View>
                        {isEditing || isAdding ? (
                            <TouchableOpacity onPress={() => onSaveuser()} style={styles.editButton}>
                                <Text style={styles.editButtonText}>Submit</Text>
                            </TouchableOpacity>
                        ) : (
                            newUser.progressionStatus !== 'Attended' ? (
                                <TouchableOpacity onPress={handleCheckInOut} style={styles.checkInOutButton}>
                                    <Text style={styles.checkInOutButtonText}>Check In</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.checkedInMessage}>Checked In</Text>
                            )
                        )}
                    </View>
                )}

            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isLoading}
                onRequestClose={() => setIsLoading(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.loadingDialog}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.loaderMessage}>{loadingMessage}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.whiteColor
    },
    leftPanel: {
        flex: 1,
        backgroundColor: colors.whiteColor,
        // padding: 20,
    },
    rightPanel: {
        flex: 1.7,
        alignItems: 'center',
        padding: 20,
        alignSelf: 'center',

    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingEnd: 10,
        paddingVertical: 10,
        borderRadius: dimen.cornerRadiusS,
    },
    disabledInput: {
        backgroundColor: colors.whiteColor,
    },
    icon: {
        marginRight: 10,
        color: colors.textColor,
        marginBottom: 20,
    },
    eventName: {
        fontSize: dimen.subHeading,
        fontWeight: 'bold',
        color: colors.textColor,
        marginBottom: 20,
    },
    userItem: {
        color: colors.whiteColor,
        // padding: 10,
        marginBottom: 10,
        borderRadius: dimen.cornerRadiusS,
        borderBottomColor: colors.darkBorderColor,

    },
    addButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: dimen.cornerRadiusS,
        alignItems: 'center',
        width: '92%',
        alignSelf: 'center',
        marginLeft: 20,
        marginBottom: 20

    },
    addButtonText: {
        fontSize: 16,
        color: colors.whiteColor,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.overlayBgColor,
    },
    modalContent: {
        backgroundColor: colors.whiteColor,
        borderRadius: dimen.cornerRadiusL,
        padding: 20,
        width: '80%',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.darkBorderColor,
        borderRadius: dimen.cornerRadiusS,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '100%',
        height: 50,
        // justifyContent:'center',
        backgroundColor: colors.whiteColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6

    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },

    userDetailsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 40,
        backgroundColor: '#E6F2FF',
        borderRadius: dimen.cornerRadiusL,
        width: '100%',
    },
    userDetailsTitle: {
        fontSize: dimen.subHeading,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: colors.textColor
    },
    userDetailRow: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',

    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.textColor,
        // alignSelf: 'center'
    },
    value: {
        flex: 1,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    privacyText: {
        fontSize: 10,
        marginBottom: 20
    },
    editButton: {
        backgroundColor: colors.accentColor,
        padding: 10,
        borderRadius: dimen.cornerRadiusS,
        marginBottom: 10,
    },
    editButtonText: {
        color: colors.whiteColor,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    checkInOutButton: {
        backgroundColor: colors.accentColor,
        padding: 10,
        borderRadius: dimen.cornerRadiusS,
    },
    checkInOutButtonText: {
        color: colors.whiteColor,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    checkedInMessage: {
        marginTop: 10,
        fontSize: dimen.textSize,
        fontWeight: 'bold',
        color: colors.success,
        backgroundColor: colors.successBg,
        padding: 10,
        borderRadius: dimen.cornerRadiusS,
        textAlign: 'center',
    },

    // Loader styles
    loaderContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.overlayBgColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderMessage: {
        marginTop: 10,
        fontSize: dimen.textSize,
        color: colors.textColor,
    },
    loadingDialog: {
        backgroundColor: colors.whiteColor,
        padding: 20,
        borderRadius: dimen.cornerRadiusL,
        alignItems: 'center',
    },

    searchInput: {
        height: 40,
        borderColor: colors.darkBorderColor,
        borderWidth: 1,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderRadius: 6,
        flexDirection: 'row',
        // justifyContent:'center',
        alignItems: 'center',
        marginLeft: 20
    },
    sectionHeader: {
        // backgroundColor: colors.whiteColor,
        paddingVertical: 8,
        paddingHorizontal: 20,
        fontSize: dimen.textSizeS,
        color: '#0179FF'

    },
    editIconStyle: {
        transform: [{ scale: 1.5 }],
        color: colors.textColor,
        marginStart: 20,
        marginTop: -10,
        padding: 5,
        borderRadius: dimen.cornerRadiusS,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemIconStyle: {
        transform: [{ scale: 1.5 }],
        marginEnd: 10,
        marginLeft: 5,
        color: colors.primary
    },
    space: {
        marginEnd: 20
    }
});

export default EventDetails;
