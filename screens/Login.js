import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import StorageHelper from "../utils/storageHelper";
import { authenticateUser, registerUser } from "../apis/loginUserApi";
import logoImage from "../assets/Group8.png";
import colors from "../utils/colors";
import { log, logError } from "../utils/logger";
import strings from "../utils/strings";

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        "Invalid Credentials",
        "Please enter both username and password."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await authenticateUser(username, password);
      if (result) {
        await StorageHelper.saveItem("isLoggedIn", "true");
        navigation.replace("TabNavigator");
      } else {
        Alert.alert(
          "Invalid Credentials",
          "Please enter correct username and password."
        );
      }
    } catch (error) {
      logError("Failed to log in:", error);
      Alert.alert(
        "Error",
        "An error occurred while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !password || !email) {
      Alert.alert("Invalid Input", "Please fill all fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert(strings.enterValidEmail);
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(username, password, email);
      if (result) {
        Alert.alert("Success", "Account created successfully. Please log in.");
        setIsSignUp(false);
      } else {
        Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } catch (error) {
      logError("Failed to sign up:", error);
      Alert.alert(
        "Error",
        "An error occurred while signing up. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Image source={logoImage} style={styles.logoImage} />
        <Text style={styles.logo}>On Spot Check-In</Text>
        <Text style={styles.subHeading}>Check in now and book your event</Text>

        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.input}>
              <Image
                source={require("../assets/maill.png")}
                style={styles.iconInput}
              />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={colors.grayScale4}
                // style={styles.input}
                style={{ flex: 1, paddingLeft: 10 }}
                keyboardType="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>
        )}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.input}>
            <Image
              source={require("../assets/tabler_user-filled.png")}
              style={styles.iconInput}
            />
            <TextInput
              placeholder="Enter your username"
              placeholderTextColor={colors.grayScale4}
              style={{ flex: 1, paddingLeft: 10 }}
              keyboardType="default"
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </View>
        <View style={[styles.inputContainer, { marginTop: 10 }]}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.input}>
            <Image
              source={require("../assets/mdi_password.png")}
              style={styles.iconInput}
            />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={colors.grayScale4}
              style={{ flex: 1, paddingLeft: 10 }}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* <Text style={styles.forgetTxt}>Forget Password?</Text> */}
        </View>
        {isSignUp ? (
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        )}
        {/* <TouchableOpacity>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity> */}
      </View>
      <TouchableOpacity
        style={styles.signupContainer}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={styles.signupLink}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <Text style={styles.txtSignUp}>
            {isSignUp ? "Sign In" : "Register Now"}
          </Text>
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="fade"
        visible={loading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator
              animating={loading}
              size="large"
              color={colors.darkBgPrimary}
            />
            <Text style={styles.loadingText}>
              {isSignUp ? "Signing up..." : "Logging in..."}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteColor,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBox: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  logoImage: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginBottom: 32,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.shadowColor,
    marginBottom: 12,
    fontFamily: "Urbanist-bold",
  },
  subHeading: {
    fontSize: 12,
    fontFamily: "Urbanist-regular",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
    marginTop: 20,
  },
  inputLabel: {
    color: "#000000",
    marginBottom: 5,
    fontFamily: "Urbanist-medium",
  },
  input: {
    width: "100%",
    backgroundColor: colors.whiteColor,
    padding: 10,
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#DFE5EC",
    flexDirection: "row",
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: colors.whiteColor,
    fontWeight: "bold",
  },
  link: {
    color: colors.primary,
    marginTop: 10,
    fontFamily: "Urbanist-medium",
  },
  signupContainer: {
    width: "100%",
    padding: 5,
    alignItems: "center",
  },
  signupLink: {
    fontSize: 15,
    color: colors.shadowColor,
    fontFamily: "Urbanist-semi",
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlayBgColor,
  },
  activityIndicatorWrapper: {
    backgroundColor: colors.whiteColor,
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.darkBgPrimary,
  },
  forgetTxt: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
    color: colors.primary,
    fontFamily: "Urbanist-medium",
  },
  txtSignUp: {
    color: colors.primary,
  },
  iconInput: {
    width: 25,
    height: 25,
    alignSelf: "center",
  },
});

export default Login;
