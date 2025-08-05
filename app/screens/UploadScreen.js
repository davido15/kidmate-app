import React from "react";
import { View, StyleSheet, Modal, Text } from "react-native";
import * as Progress from "react-native-progress";
import colors from "../config/colors";


function UploadScreen({onDone, progress = 0, visible = false }) {
  return (
    <Modal visible={visible}>
      <View style={styles.container}>
        {progress < 1 ? (
          <Progress.Bar
            color={colors.secondary}
            progress={progress}
            width={200}
          />
        ) : (
          <LotieView
            autoPlay
            onAnimationFinish={onDone}
            loop={false}
            source={require("../assets/animations/done.json")}
            styles={styles.animation}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  animation:{
      width:150
  }
});

export default UploadScreen;
