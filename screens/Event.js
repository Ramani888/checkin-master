import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from "react-native-vector-icons/FontAwesome";
import colors from "../utils/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import dimen from "../utils/dimen";
import strings from "../utils/strings";

const Event = () => {
  const navigation = useNavigation();
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [number, setNumber] = useState("");
  const [events, setEvents] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingSync, setPendingSync] = useState([]);
  const { width } = useWindowDimensions(); // Get screen width dynamically
  const numColumns = width > 768 ? 2 : 1; // 2 columns for large screens, 1 for mobile

  const data = Array(10).fill({
    name: "Sunshine Business Event",
    date: "12 August 2024",
    totalMember: 20,
  });

  const fetchEvents = async () => {
      try {
        setMessage(strings.loadingEvents);
        const results = Array.from(await mydb.getAllEvents());
  
        log("Fetched events:", results);
  
        if (results && results.length > 0) {
          console.log('results1',results)
          setEvents(results);
          navigation.navigate('Event',{eventResult: results })
        } else {
          console.log('results2',results)
          log("No events found in the database");
          navigation.navigate('Event',{eventResult: results })
        }
      } catch (error) {
        logError("Failed to fetch events", error);
      }
      setLoading(false);
    };

  const handleAddEvent = async () => {
      setIsAddingEvent(false);
      const isConnected = await checkInternetConnectivity();
      if (!isConnected) {
        Alert.alert(strings.noInternet);
        return;
      }
      if (!eventName) {
        Alert.alert(strings.eventCannotBeBlank);
        return;
      }
      if (events.some((event) => event.id == eventName)) {
        Alert.alert(strings.eventAlreadyAdded);
        return;
      }
      try {
        setLoading(true);
        setMessage(strings.eventAdding);
        const eventData = await fetchEventAndUsersData(eventName, token);
        log("eventData:", eventData);
  
        if (!eventData) {
          Alert.alert(strings.noEventFound);
          return;
        }
        setEventName("");
        setIsAddingEvent(false);
        fetchEvents();
        setMessage(strings.eventAddSuccess);
      } catch (error) {
        logError("Failed to add event", error);
        Alert.alert(strings.addEventfailed);
      } finally {
        setLoading(false);
      }
    };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetail")}
    >
      <Text style={styles.eventName}>{item?.name}</Text>
      <View style={styles.secondView}>
        <Text style={styles.eventDate}>{item?.date}</Text>
        <View style={styles.memberContainer}>
          <FontAwesome name="users" size={20} color={colors.mediumGray} />
          <Text style={styles.totalMember}>{item?.totalMember} Members</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={true}
    nestedScrollEnabled={true}
  >
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.outerContainer}>
       
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <AntDesign name="arrowleft" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Events</Text>
            <View style={styles.placeholderView} />
          </View>

          {/* Video Section */}
          <View style={styles.videoContainer}>
            <Image
              source={require("../assets/videoThumb.webp")}
              style={styles.videoThumbnail}
            />
            <Text
              style={[styles.videoText, { fontSize: width > 768 ? 24 : 18 }]}
            >
              Need help in adding a new event? Watch the video and let's do it
            </Text>
          </View>

          {/* My Events Section */}
          <View style={styles.myEventsContainer}>
            <Text
              style={[styles.myEventsText, { fontSize: width > 768 ? 32 : 24 }]}
            >
              My Events
            </Text>
            <TouchableOpacity
              style={[styles.button, { width: width > 768 ? 227 : "50%" }]}
              onPress={() => setIsAddingEvent(true)}
            >
              <Text style={styles.buttonText}>Add Event</Text>
            </TouchableOpacity>
          </View>

          {/* Event List (Wrap FlatList in View to prevent blocking ScrollView) */}
          <View style={{ flex: 1 }}>
            <FlatList
              data={data}
              renderItem={renderItem}
              numColumns={numColumns} // Dynamically adjust numColumns
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false} // Disable FlatList scrolling, use ScrollView
            />
          </View>
       
        {isAddingEvent ? (
          <View style={styles.addEventContainer}>
            <TouchableOpacity
              onPress={() => setIsAddingEvent(false)}
              style={{
                backgroundColor: "#E6F2FF",
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 30,
                alignSelf: "flex-end",
                marginTop: 2,
                marginBottom: 10,
              }}
            >
              <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={styles.heading}>{strings.addEvent}</Text>
              <Text style={{ marginBottom: 30 }}>
                {"Enter your event Details"}
              </Text>
            </View>
            {/* <Text style={styles.eventIdHeading}>{strings.eventId}</Text>
                      <View style={styles.input}>
                        <TextInput
                          style={{ flex: 1, paddingHorizontal: 20 }}
                          value={eventName}
                          onChangeText={setEventName}
                        />
                      </View> */}
            <Text style={styles.eventIdHeading}>{strings.eventName}</Text>
            <View style={styles.input}>
              <TextInput
                style={{ flex: 1, paddingHorizontal: 20 }}
                value={eventName}
                onChangeText={setEventName}
              />
            </View>
            <Text style={styles.eventIdHeading}>{strings.eventDate}</Text>
            <View style={styles.input}>
              <TextInput
                style={{ flex: 1, paddingHorizontal: 20 }}
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>
            <Text style={styles.eventIdHeading}>{strings.numberOfMember}</Text>
            <View style={styles.input}>
              <TextInput
                style={{ flex: 1, paddingHorizontal: 20 }}
                value={number}
                onChangeText={setNumber}
              />
            </View>
            <TouchableOpacity
              style={styles.addEventButton}
              onPress={handleAddEvent}
            >
              <Text style={styles.buttonText}>{"Add Event"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsAddingEvent(false)}
              style={{ marginTop: 30 }}
            >
              <Text style={{ color: "#697F96", fontSize: 20 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* <WebView
                      source={{ uri: strings.videoUrlAllEvents }}
                      style={styles.videoThumbnail}
                    /> */}
          </View>
        )}
      </View>
    </SafeAreaView>
    </ScrollView>
  );
};

export default Event;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    overflow: "scroll", // Fix for Web scrolling
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    paddingHorizontal: 10,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#DFE5EC",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Urbanist-Medium",
  },
  placeholderView: {
    width: 44,
  },
  videoContainer: {
    backgroundColor: "#b0d5ff",
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 120,
  },
  videoThumbnail: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  videoText: {
    color: colors.black,
    fontFamily: "Urbanist-Bold",
    marginLeft: 20,
    flex: 1,
  },
  myEventsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
    marginHorizontal: 15,
  },
  myEventsText: {
    color: colors.black,
    fontFamily: "Urbanist-SemiBold",
  },
  button: {
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: colors.whiteColor,
    fontFamily: "Urbanist-Bold",
  },
  listContainer: {
    backgroundColor: colors.grayScale3,
    padding: 10,
    margin: 15,
    borderRadius: 10,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    margin: 5,
    flex: 1,
    minWidth: "45%", // Ensure flexible width for responsiveness
    marginBottom: 5,
  },
  eventName: {
    fontSize: 24,
    color: colors.black,
    fontFamily: "Urbanist-Medium",
  },
  secondView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  eventDate: {
    fontSize: 18,
    color: colors.mediumGray,
    fontFamily: "Urbanist-Regular",
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  totalMember: {
    fontSize: 18,
    color: colors.mediumGray,
    fontFamily: "Urbanist-Regular",
    marginLeft: 5,
  },
  addEventContainer: {
    justifyContent: "center",
    width: "80%",
    backgroundColor: colors.whiteColor,
    padding: 20,
    borderRadius: dimen.cornerRadiusL,
    marginHorizontal: 60,
    alignSelf: "center",
    marginBottom: 110,
    alignItems: "center",
    elevation: 5
  },
  heading: {
    fontSize: dimen.heading,
    fontWeight: "bold",
    marginBottom: 19,
  },
  eventIdHeading: {
    alignSelf: "flex-start",
    padding: 5,
    color: colors.headerTextColor,
    marginTop: 5,
  },
  input: {
    width: "100%",

    height: 57,
    borderColor: colors.darkBorderColor,
    borderWidth: 1,
    borderRadius: dimen.cornerRadiusS,
    // paddingHorizontal: 10,
    // marginBottom: 10,
  },
  addEventButton: {
    backgroundColor: colors.primary,
    borderRadius: dimen.cornerRadiusS,
    alignSelf: "center",
    alignItems: "center",
    height: 60,
    width: "100%",
    marginTop: 25,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: dimen.textSize,
  },
});
