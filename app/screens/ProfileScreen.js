import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";


import Screen from "../components/Screen";
import MsgItem from "../components/MsgItem";

import ListItemDelete from "../components/ListItemDelete";

const initialMessages = [
    {
        id: 1,
        title:
            "Task Updated",
        description:
            "text ever since the 1502s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker",
        image: require("../assets/pizza1.png"),
    },
    {
        id: 1,
        title:
            "Task Updated",
        description:
            "text ever since the 1502s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker",
        image: require("../assets/pizza1.png"),
    },
    {
        id: 2,
        title:
            "Task Updated",
        description:
            "text ever since the 1502s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker",
        image: require("../assets/pizza1.png"),
    },
    {
        id: 3,
        title:
            "Task Updated",
        description:
            "text ever since the 1502s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker",
        image: require("../assets/pizza1.png"),
    },

];

function ProfileScreen(props) {
    const [messages, setMessages] = useState(initialMessages);

    const [refreshing, setRefreshing] = useState(false);

    const handleDelete = (message) => {
        // delete message in view
        const newMessages = setMessages(
            messages.filter((m) => m.id !== message.id)
        );
        //dlete message from backend
    };
    return (
        <Screen>
            <FlatList
                data={messages}
                keyExtractor={(message) => message.id.toString()}
                renderItem={({ item }) => (
                    <MsgItem
                        title={item.title}
                        subTitle={item.description}
                        onPress={() => console.log("good")}
                        image={item.image}
                        renderRightActions={() => (
                            <ListItemDelete onPress={() => handleDelete(item)} />
                        )}
                    />
                )}

                refreshing={refreshing}
                onRefresh={() => {
                    /**setMessages([
                      {
                        id: 2,
                        title: "T2",
                        description: "D2",
                        image: require("../assets/pizza1.png"),
                      },
                    ]);**/
                    console.log("good")
                }}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});

export default ProfileScreen;
