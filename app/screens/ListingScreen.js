import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet ,RefreshControl} from "react-native";
import ActivityIndicator from "../components/ActivityIndicator";

import Card from "../components/Card";
import colors from "../config/colors";
import routes from "../navigation/routes";
import Screen from "../components/Screen";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";

import listingsApi from "../api/listings";

/*
const listings = [
  {
    id: 1,
    title: "Red jacket for sale",
    price: 100,
    image: require("../assets/burger.jpg"),
  },
  {
    id: 2,
    title: "Couch in great condition",
    price: 1000,
    image: require("../assets/burger.jpg"),
  },
];
*/

function ListingScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState([false]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const response = await listingsApi.getListings();
    setLoading(false);
    setRefreshing(false);

    if (!response.ok) return setError(true);

    setError(false);
   console.log( setListings(response.data));
   console.log(listings[0])
  };

  return (
    <Screen style={styles.screen}>
      {error && (
        <>
          <AppText>Couldn't retrieve the listings</AppText>

          <AppButton title="Retry" onPress={loadListings} />
        </>
      )}

      <ActivityIndicator visible={loading} />

      <FlatList
        data={listings}
        keyExtractor={(listing) => listing.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadListings} />
        }
        renderItem={({ item }) => (
          <Card
            color={item.status}
            title={item.title}
            status={item.status}
            createdat={item.createdat}
            createdby={item.createdby}
            subTitle={item.description}
            imageUrl={item.url}
           
            onPress={() => navigation.navigate(routes.LISTING_DETAILS, item)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    backgroundColor: colors.light,
  },
});

export default ListingScreen;
