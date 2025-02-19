import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import colors from "../utils/colors";

const Event = () => {
  const navigation = useNavigation();

  const data = [
    {
      name: "Sunshine Business Event",
      date: "12 August 2024",
      totalMember: 20,
    },
    {
      name: "Sunshine Business Event",
      date: "12 August 2024",
      totalMember: 20,
    },
    {
      name: "Sunshine Business Event",
      date: "12 August 2024",
      totalMember: 20,
    },
    {
      name: "Sunshine Business Event",
      date: "12 August 2024",
      totalMember: 20,
    },
    {
      name: "Sunshine Business Event",
      date: "12 August 2024",
      totalMember: 20,
    },
    {
      name: "Sunshine Business Event",
      date: "12 August 2024",
      totalMember: 20,
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventName}>{item?.name}</Text>
      <View style={styles.secondView}>
        <Text style={styles.eventDate}>{item?.date}</Text>
        <View style={styles.memberContainer}>
          <FontAwesome name="users" size={20} color={colors.mediumGray} />
          <Text style={styles.totalMember}>{item?.totalMember} Members</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flex: 1 }}>
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
        <Text style={styles.videoText}>
          Need help in adding a new event? Watch the video and let's do it
        </Text>
      </View>

      {/* My Events Section */}
      <View style={styles.myEventsContainer}>
        <Text style={styles.myEventsText}>My Events</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Event List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </ScrollView>
  );
};

export default Event;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: 500,
    backgroundColor: colors.white,
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
  },
  videoThumbnail: {
    width: 236,
    height: 124,
  },
  videoText: {
    fontSize: 32,
    color: colors.black,
    fontFamily: "Urbanist-Bold",
    marginLeft: 20,
    width: 500,
  },
  myEventsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginVertical: 20,
    marginLeft: 15,
  },
  myEventsText: {
    fontSize: 32,
    color: colors.black,
    fontFamily: "Urbanist-SemiBold",
  },
  button: {
    width: 227,
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
    marginTop: 15,
  },
  eventDate: {
    fontSize: 18,
    color: colors.mediumGray,
    fontFamily: "Urbanist-Regular",
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 10,
  },
  totalMember: {
    fontSize: 18,
    color: colors.mediumGray,
    fontFamily: "Urbanist-Regular",
    marginLeft: 5,
  },
});
