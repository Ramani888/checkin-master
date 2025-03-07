
// import React from "react";
// import {
//   FlatList,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import colors from "../utils/colors";
// import { SafeAreaView } from "react-native-safe-area-context";

// const Event = () => {
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions(); // Get screen width dynamically
//   const numColumns = width > 768 ? 2 : 1; // 2 columns for large screens, 1 for mobile

//   const data = [
//     {
//       name: "Sunshine Business Event",
//       date: "12 August 2024",
//       totalMember: 20,
//     },
//     {
//       name: "Sunshine Business Event",
//       date: "12 August 2024",
//       totalMember: 20,
//     },
//     {
//       name: "Sunshine Business Event",
//       date: "12 August 2024",
//       totalMember: 20,
//     },
//     {
//       name: "Sunshine Business Event",
//       date: "12 August 2024",
//       totalMember: 20,
//     },
//     {
//       name: "Sunshine Business Event",
//       date: "12 August 2024",
//       totalMember: 20,
//     },
//     {
//       name: "Sunshine Business Event",
//       date: "12 August 2024",
//       totalMember: 20,
//     },
//   ];

//   const renderItem = ({ item }) => (
//     <View style={styles.eventCard}>
//       <Text style={styles.eventName}>{item?.name}</Text>
//       <View style={styles.secondView}>
//         <Text style={styles.eventDate}>{item?.date}</Text>
//         <View style={styles.memberContainer}>
//           <FontAwesome name="users" size={20} color={colors.mediumGray} />
//           <Text style={styles.totalMember}>{item?.totalMember} Members</Text>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={{flex:1}}>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={{ flexGrow: 1 }}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//           >
//             <AntDesign name="arrowleft" size={24} color={colors.primary} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Events</Text>
//           <View style={styles.placeholderView} />
//         </View>

//         {/* Video Section */}
//         <View style={styles.videoContainer}>
//           <Image
//             source={require("../assets/videoThumb.webp")}
//             style={styles.videoThumbnail}
//           />
//           <Text style={[styles.videoText, { fontSize: width > 768 ? 24 : 18 }]}>
//             Need help in adding a new event? Watch the video and let's do it
//           </Text>
//         </View>

//         {/* My Events Section */}
//         <View style={styles.myEventsContainer}>
//           <Text
//             style={[styles.myEventsText, { fontSize: width > 768 ? 32 : 24 }]}
//           >
//             My Events
//           </Text>
//           <TouchableOpacity
//             style={[styles.button, { width: width > 768 ? 227 : "50%" }]}
//           >
//             <Text style={styles.buttonText}>Add Event</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Event List */}
//         <FlatList
//           data={data}
//           renderItem={renderItem}
//           numColumns={numColumns} // Dynamically adjust numColumns
//           keyExtractor={(item, index) => index.toString()}
//           contentContainerStyle={styles.listContainer}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Event;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 15,
//     paddingHorizontal: 10,
//   },
//   backButton: {
//     borderWidth: 1,
//     borderColor: "#DFE5EC",
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontFamily: "Urbanist-Medium",
//   },
//   placeholderView: {
//     width: 44,
//   },
//   videoContainer: {
//     backgroundColor: "#b0d5ff",
//     marginVertical: 15,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     height: 120,
//   },
//   videoThumbnail: {
//     width: 100,
//     height: 100,
//     resizeMode: "contain",
//   },
//   videoText: {
//     color: colors.black,
//     fontFamily: "Urbanist-Bold",
//     marginLeft: 20,
//     flex: 1,
//   },
//   myEventsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginVertical: 20,
//     marginHorizontal: 15,
//   },
//   myEventsText: {
//     color: colors.black,
//     fontFamily: "Urbanist-SemiBold",
//   },
//   button: {
//     height: 60,
//     backgroundColor: colors.primary,
//     borderRadius: 5,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     fontSize: 20,
//     color: colors.whiteColor,
//     fontFamily: "Urbanist-Bold",
//   },
//   listContainer: {
//     backgroundColor: colors.grayScale3,
//     padding: 10,
//     margin: 15,
//     borderRadius: 10,
//   },
//   eventCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 20,
//     margin: 5,
//     flex: 1,
//     minWidth: "45%", // Ensure flexible width for responsiveness
//     marginBottom: 5,
//   },
//   eventName: {
//     fontSize: 24,
//     color: colors.black,
//     fontFamily: "Urbanist-Medium",
//   },
//   secondView: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   eventDate: {
//     fontSize: 18,
//     color: colors.mediumGray,
//     fontFamily: "Urbanist-Regular",
//   },
//   memberContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   totalMember: {
//     fontSize: 18,
//     color: colors.mediumGray,
//     fontFamily: "Urbanist-Regular",
//     marginLeft: 5,
//   },
// });


import React from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import colors from "../utils/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const Event = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions(); // Get screen width dynamically
  const numColumns = width > 768 ? 2 : 1; // 2 columns for large screens, 1 for mobile

  const data = Array(10).fill({
    name: "Sunshine Business Event",
    date: "12 August 2024",
    totalMember: 20,
  });

  const renderItem = ({ item }) => (
    <Pressable style={styles.eventCard} onPress={() => navigation.navigate('EventDetail')}>
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.outerContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true} // Ensure scroll visibility
          nestedScrollEnabled={true} // Allow inner scrolls
        >
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
            <Text style={[styles.videoText, { fontSize: width > 768 ? 24 : 18 }]}>
              Need help in adding a new event? Watch the video and let's do it
            </Text>
          </View>

          {/* My Events Section */}
          <View style={styles.myEventsContainer}>
            <Text style={[styles.myEventsText, { fontSize: width > 768 ? 32 : 24 }]}>
              My Events
            </Text>
            <TouchableOpacity
              style={[styles.button, { width: width > 768 ? 227 : "50%" }]}
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
        </ScrollView>
      </View>
    </SafeAreaView>
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
});
