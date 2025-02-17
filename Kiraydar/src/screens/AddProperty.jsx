import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {KeyboardAvoidingView} from 'react-native';
import {debounce} from 'lodash';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {Field, Formik} from 'formik';
import Icon from 'react-native-vector-icons/Entypo';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Picker as SelectPicker} from '@react-native-picker/picker';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete ';
import {ScrollView} from 'react-native-virtualized-view';
import {Image} from 'react-native-svg';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import loadAndDecodeToken from '../Controller/LoadAndDecodeToken';
import {BASE_URL} from '../api';
import Loading from '../components/Loading';
import AlertBox from '../components/AlertBox';
import MapboxPlacesAutocomplete from 'react-native-mapbox-places-autocomplete';
import {FlatList} from 'react-native-gesture-handler';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiaHVyYWlyYXNoYWhpZCIsImEiOiJjbTVrcmlqaWQxZjN5MmtzN2s0cDhkbjNvIn0.wJjeZBrpoJF7Un50Qrl2VQ',
);
const MyComponent = React.memo(({childDataExtract}) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [markerPosition, setMarkerPosition] = useState([0, 0]);
  const [showConfirmLocation, setshowConfirmLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null); // State to store selected place

  const triggerCallback = () => {
    childDataExtract({query, markerPosition});
    console.log('MERA KUMI', coordinates);
  };

  const fetchCoordinates = async place => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      place,
    )}.json?access_token=pk.eyJ1IjoiaHVyYWlyYXNoYWhpZCIsImEiOiJjbTVrcmlqaWQxZjN5MmtzN2s0cDhkbjNvIn0.wJjeZBrpoJF7Un50Qrl2VQ`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      // Extract coordinates from the first result
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates; // [longitude, latitude]
        console.log('Coordinates:', coordinates);
        return coordinates;
      } else {
        console.log('No coordinates found for this place');
        return null;
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  const onMarkerDragEnd = e => {
    const {longitude, latitude} = e.geometry.coordinates;
    setCoordinates([`Longitude: ${longitude}`, `Latitude: ${latitude}`]);
    setMarkerPosition([longitude, latitude]);
  };

  const fetchPlaces = async searchQuery => {
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
      searchQuery,
    )}&access_token=pk.eyJ1Ijoic2VhcmNoLW1hY2hpbmUtdXNlci0xIiwiYSI6ImNrNnJ6bDdzdzA5cnAza3F4aTVwcWxqdWEifQ.RFF7CVFKrUsZVrJsFzhRvQ&session_token=4ce0dcb6-18eb-47a5-947d-c23fe114280f&language=en&types=country%2Cregion%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Cneighborhood%2Caddress%2Cpoi%2Cstreet%2Ccategory`;

    try {
      const response = await axios.get(url);
      setPlaces(response.data.suggestions); // Update places list
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleInputChange = text => {
    setQuery(text);
    fetchPlaces(text);
  };

  const SelectItem = async item => {
    console.log('Selected Item:', item);
    setSelectedPlace(item); // Set the selected place to show on the map
    setQuery(`${item.name} - ${item.full_address}`);
    setshowConfirmLocation(true);
    // Fetch coordinates for the selected place
    const coordinates = await fetchCoordinates(item.full_address); // Use place name or full address
    if (coordinates) {
      console.log(coordinates);
      setMarkerPosition(coordinates); // Set marker position on the map
    }
  };
  const onMapPress = event => {
    console.log('PAreesa 1', event.geometry.coordinates[0]);
    setCoordinates([
      `Longitude: ${event.geometry.coordinates[0]}`,
      `Latitude: ${event.geometry.coordinates[1]}`,
    ]);
    const {geometry} = event;
    setMarkerPosition(geometry.coordinates);
  };

  return (
    <View style={{flex: 1}}>
      {/* Search Input */}

      <TextInput
        style={{
          borderRadius: 5,
          marginHorizontal: 5,
          borderWidth:1,

          marginTop: 5,
          marginBottom: 5,
          paddingLeft: 10,
          borderColor: 'grey',
          shadowColor: '#000',
          backgroundColor: 'white',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 2,
          marginBottom: 15,
        }}
        multiline={true}
        placeholder="Search for nearby places"
        value={query}
        onChangeText={handleInputChange}
      />
      {/* Results List - only show when no place is selected */}
      {!selectedPlace && (
        <FlatList
          data={places}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => SelectItem(item)}
              style={styles.resultItem}>
              <Text>{item.name}</Text>
              <Text style={{fontSize: 10}}>{item.full_address}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
        onPress={() => {
          setshowConfirmLocation(true);
        }}
        style={{backgroundColor: 'blue', width: '100%', padding: 10}}>
        <Text style={{fontSize: 12, color: 'white', textAlign: 'center'}}>
          Show Exact Location on Map
        </Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={showConfirmLocation}
        animationType="fade"
        style={{width: '90%'}}>
        <View style={styles.overlay}>
          <Mapbox.MapView
            style={{height: '80%', width: '90%'}}
            styleURL="mapbox://styles/mapbox/streets-v12"
            onPress={onMapPress} // Add this to handle map clicks
          >
            <Mapbox.Camera
              zoomLevel={15}
              centerCoordinate={[markerPosition[0], markerPosition[1]]} // Set map center to selected place
            />
            <Mapbox.MarkerView
              coordinate={markerPosition}
              draggable
              onDragEnd={onMarkerDragEnd}>
              <View style={styles.marker} />
            </Mapbox.MarkerView>
          </Mapbox.MapView>
          <TouchableOpacity
            onPress={() => {
              setshowConfirmLocation(false);
              triggerCallback();
            }}
            style={{borderRadius: 10}}>
            <Text
              style={{backgroundColor: 'white', padding: 10, marginTop: 10}}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
});

const AddProperty = ({navigation}) => {
  const [decodeData, setDecodeData] = useState();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescriptiion] = useState('');
  const [data, setData] = useState();
  const placeRef = useRef(null); // Replace useState for `place`
  const coordinateRef = useRef(null); // Replace useState for `coordinate`

  const childDataExtract = childData => {
    console.log(childData);
    coordinateRef.current = childData.markerPosition;
    placeRef.current = childData.query;
  };

  useEffect(() => {
    const handleLoadAndDecode = async () => {
      try {
        const decoded = await loadAndDecodeToken(); // Assuming loadAndDecodeToken does not require any parameters
        setDecodeData(decoded); // Assuming you want to log the decoded token
      } catch (error) {
        console.error('Error loading and decoding token:', error);
      }
    };
    handleLoadAndDecode();
  }, []);

  const [uploadedImage, setUploadImage] = useState([]);
  const takePhotoFromCamera = () => {
    console.log('camera');
  };
  console.log(uploadedImage);
  const toggleShowAlert = stateChange => {
    setShowAlert(stateChange);
    navigation.navigate('IndiviualProperty', {data});
  };
  const uploadPhotoFromDevice = async (setFieldValue, values) => {
    try {
      const images = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        multiple: true,
      });

      const newImages = images.map(image => ({
        uri: image.path,
        name: image.path.split('/').pop(),
        type: image.mime,
      }));

      setFieldValue('images', [...values.images, ...newImages]);
    } catch (error) {
      console.error('Image selection error:', error);
    }
  };

  const prepareFormData = async data => {
    // Create FormData object
    const formData = new FormData();

    // Append JSON data as a string
    const jsonData = JSON.stringify({
      title: data.title,
      description: data.description,
      type: data.category,
      rent: data.rent,
      advance: data.advance,
      bachelor: data.Bachelor,
      address: data.address,
      bedroom: data.bedroom,
      bathroom: data.bathroom,
      areaofhouse: data.area,
      peoplesharing: data.peopleSharing,
      propertyOwner: data.propertyOwner,
    });
    formData.append('jsonData', jsonData);

    // Append each image to the FormData object
    for (const image of data.images) {
      formData.append('images', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    }

    return formData;
  };

  const uploadToServer = async data => {
    console.log('a');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.category);
      formData.append('rent', data.rent);
      formData.append('advance', data.advance);
      formData.append('bachelor', data.Bachelor);
      formData.append('address', placeRef.current);
      formData.append('coordinate', coordinateRef.current);
      formData.append('bedroom', data.bedroom);
      formData.append('bathroom', data.bathroom);
      formData.append('areaofhouse', data.area);
      formData.append('peoplesharing', data.peopleSharing);
      formData.append('propertyOwner', decodeData.response._id);

      // Append images
      data.images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });
      });

      const response = await axios.post(
        `${BASE_URL}/api/property/createProperty`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setData(response.data.property);
      console.log('dataResponse', response.data.property);
      setLoading(false);
      setShowAlert(true);
      setTitle('Property Added Successfulyy');
      setDescriptiion('Property has been successfully added to the system');
    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);
    }
  };
  const defaultImages = Array(10).fill({
    uri: 'https://www.olx.com.pk/assets/iconAddPhoto_noinline.8924e2486f689a28af51da37a7bda6ec.svg',
  }); // Placeholder images

  return (
    <>
      <Image
        source={{uri: 'http://www.clicktorelease.com/code/gif/1.gif'}}
        style={{width: 1000, height: 1000}}
      />
      <ScrollView style={{paddingHorizontal: 15, backgroundColor: 'white'}}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Ionicons
            style={{fontSize: 30, marginVertical: 10, color: 'black'}}
            name="arrow-back-outline"></Ionicons>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 23,
            fontFamily: 'Abel-Regular',
            fontWeight: '700',
            color: 'black',
            marginTop: 10,
            marginHorizontal: 'auto',
          }}>
          POST YOUR AD
        </Text>
        <Formik
          initialValues={{
            category: 'Home',
            title: '',
            description: '',
            advance: '',
            rent: '',
            Bachelor: true,
            bedroom: '',
            bathroom: 0,
            area: '',
            peopleSharing: 0,
            address: '',
            images: [],
          }}
          onSubmit={values => {
            console.log('Submitting Form:', values);
            uploadToServer(values);
          }}
          validate={values => {
            const errors = {};
            if (!values.title) {
              errors.title = 'Field is Required';
            }
            if (!values.description) {
              errors.description = 'Field is Required';
            }
            if (!values.advance) {
              errors.advance = 'Field is Required';
            }
            if (!values.rent) {
              errors.rent = 'Field is Required';
            }
            if (!values.bedroom) {
              errors.bedroom = 'Field is Required';
            }
            if (!values.bathroom) {
              errors.bathroom = 'Field is Required';
            }
            if (!values.area) {
              errors.area = 'Field is Required';
            }
            if (!values.peopleSharing) {
              errors.peopleSharing = 'Field is Required';
            }

            console.log(errors);
            return errors;
          }}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            errors,
            touched,
            values,
          }) => (
            <>
              <View style={{marginTop: 20}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Abel-Regular',
                    color: 'black',
                    fontWeight: 700,
                  }}>
                  Category
                </Text>
                <View style={styles.PropertyContainer}>
                  <TouchableOpacity
                    style={[
                      styles.PropertyItem,
                      values.category === 'Home' && styles.selectedPropertyItem,
                    ]}
                    onPress={() => {
                      setFieldValue('category', 'Home');
                    }}>
                    <Icon
                      name="home"
                      style={[
                        styles.PropertyIcon,
                        values.category === 'Home' &&
                          styles.selectedPropertyItem,
                      ]}
                    />
                    <Text
                      style={[
                        styles.PropertyText,
                        values.category === 'Home' &&
                          styles.selectedPropertyText,
                      ]}>
                      House
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.PropertyItem,
                      values.category === 'Flats' &&
                        styles.selectedPropertyItem,
                    ]}
                    onPress={() => {
                      setFieldValue('category', 'Flats');
                    }}>
                    <CommunityIcon
                      name="office-building"
                      style={[
                        styles.PropertyIcon,
                        values.category === 'Flats' &&
                          styles.selectedPropertyItem,
                      ]}
                    />
                    <Text
                      style={[
                        styles.PropertyText,
                        values.category === 'Flats' &&
                          styles.selectedPropertyText,
                      ]}>
                      Flats
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.PropertyItem,
                      values.category === 'Hostel' &&
                        styles.selectedPropertyItem,
                    ]}
                    onPress={() => {
                      setFieldValue('category', 'Hostel');
                    }}>
                    <AwesomeIcon
                      name="home"
                      style={[
                        styles.PropertyIcon,
                        values.category === 'Hostel' &&
                          styles.selectedPropertyItem,
                      ]}
                    />
                    <Text
                      style={[
                        styles.PropertyText,
                        values.category === 'Hostel' &&
                          styles.selectedPropertyText,
                      ]}>
                      Hostel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.PropertyItem,
                      values.category === 'Property' &&
                        styles.selectedPropertyItem,
                    ]}
                    onPress={() => {
                      setFieldValue('category', 'Property');
                    }}>
                    <CommunityIcon
                      name="home-city"
                      style={[
                        styles.PropertyIcon,
                        values.category === 'Property' &&
                          styles.selectedPropertyItem,
                      ]}
                    />
                    <Text
                      style={[
                        styles.PropertyText,
                        values.category === 'Property' &&
                          styles.selectedPropertyText,
                      ]}>
                      Property
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.addImageContainer}>
                <View style={{marginRight: 10}}>
                  <Text style={{fontWeight: 600, fontSize: 14, color: 'black'}}>
                    Upload Images
                  </Text>
                </View>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}>
                    <Pressable
                      onPress={() =>
                        uploadPhotoFromDevice(setFieldValue, values)
                      }
                      style={styles.addImageBox}>
                      <AwesomeIcon
                        style={styles.addImageIcon}
                        name="cloud-upload"
                      />
                    </Pressable>

                    {(values.images.length > 0 ? values.images : defaultImages)
                      .slice(0, 2)
                      .map((image, index) => (
                        <View key={index} style={{paddingHorizontal: 5}}>
                          <ImageBackground
                            style={{
                              width: 60,
                              height: 60,
                              borderWidth: 1,
                              borderColor: '#868e96',
                              borderRadius: 10,
                            }}
                            source={{uri: image.uri}}
                          />
                        </View>
                      ))}
                  </View>

                  {/* Second Row */}
                  <View style={{flexDirection: 'row', marginTop: 10}}>
                    {(values.images.length > 0 ? values.images : defaultImages)
                      .slice(2, 5)
                      .map((image, index) => (
                        <View key={index} style={{paddingHorizontal: 5}}>
                          <ImageBackground
                            style={{
                              width: 60,
                              height: 60,
                              borderWidth: 1,
                              borderColor: 'grey',
                              borderRadius: 10,
                            }}
                            source={{uri: image.uri}}
                          />
                        </View>
                      ))}
                  </View>

                  {/* Third Row */}
                  <View style={{flexDirection: 'row', marginTop: 10}}>
                    {(values.images.length > 0 ? values.images : defaultImages)
                      .slice(5, 8)
                      .map((image, index) => (
                        <View key={index} style={{paddingHorizontal: 5}}>
                          <ImageBackground
                            style={{
                              width: 60,
                              height: 60,
                              borderWidth: 1,
                              borderColor: 'grey',
                              borderRadius: 10,
                            }}
                            source={{uri: image.uri}}
                          />
                        </View>
                      ))}
                  </View>
                  <Text style={{marginTop: 10, fontSize: 13, marginRight: 20}}>
                    For the cover picture we recommend using the landscape mode
                  </Text>
                </View>
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: 'grey',
                  paddingBottom: 20,
                }}>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Property Type*
                  </Text>
                  <View style={{flexDirection: 'row', paddingTop: 10}}>
                    {/* Bachelor Button */}
                    <TouchableOpacity
                      onPress={() => setFieldValue('Bachelor', 'true')} // Updating Formik value
                      style={{
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        borderWidth:1,

                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 2,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        margin: 2,
                        borderRadius: 4,
                        marginRight: 10,
                        borderColor:
                          values.Bachelor === 'true' ? 'blue' : 'grey',
                        backgroundColor:
                          values.Bachelor === 'true' ? '#D6E4FF' : 'white',
                      }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: values.Bachelor === 'true' ? 'blue' : 'black',
                        }}>
                        Bachelor
                      </Text>
                    </TouchableOpacity>

                    {/* Non-Bachelor Button */}
                    <TouchableOpacity
                      onPress={() => setFieldValue('Bachelor', 'false')} // Updating Formik value
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        borderWidth:1,

                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 2,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        margin: 2,
                        borderRadius: 4,
                        marginRight: 10,
                        borderColor:
                          values.Bachelor === 'false' ? 'blue' : 'grey',
                        backgroundColor:
                          values.Bachelor === 'false' ? '#D6E4FF' : 'white',
                      }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: values.Bachelor === 'false' ? 'blue' : 'black',
                        }}>
                        Non Bachelor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Bedrooms*
                  </Text>
                  <View style={{marginTop: 2, width: '100%'}}>
                    <SelectPicker
                      style={[styles.InputText, {color: 'grey', fontSize: 10}]}
                      selectedValue={values.bedroom || ''} // Ensure default value is handled
                      onValueChange={value => setFieldValue('bedroom', value)}>
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="Select Bedroom"
                        value=""
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="1"
                        value="1"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="2"
                        value="2"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="3"
                        value="3"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="4"
                        value="4"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="5"
                        value="5"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="6"
                        value="6"
                      />
                    </SelectPicker>
                  </View>
                  {errors.bedroom && touched.bedroom && (
                    <Text style={styles.errorText}>{errors.bedroom}</Text>
                  )}
                </View>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Bathrooms*
                  </Text>
                  <View style={{marginTop: 2, width: '100%'}}>
                    <SelectPicker
                      style={[styles.InputText, {color: 'grey', fontSize: 10}]}
                      selectedValue={values.bathroom || ''} // Ensure default value is handled
                      onValueChange={value => setFieldValue('bathroom', value)}>
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="Select Bathroom"
                        value=""
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="1"
                        value="1"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="2"
                        value="2"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="3"
                        value="3"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="4"
                        value="4"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="5"
                        value="5"
                      />
                      <SelectPicker.Item
                        style={{fontSize: 12}}
                        label="6"
                        value="6"
                      />
                    </SelectPicker>
                  </View>
                  {errors.bathroom && touched.bathroom && (
                    <Text style={styles.errorText}>{errors.bathroom}</Text>
                  )}
                </View>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Area in Sq/feet*
                  </Text>
                  <View style={{marginTop: 2, width: '100%'}}>
                    <TextInput
                      style={styles.InputText}
                      onChangeText={handleChange('area')}
                      onBlur={handleBlur('area')}
                      value={values.area}
                      placeholder="Area in Sq/feet"
                      keyboardType="numeric"
                    />
                  </View>
                  {errors.area && touched.area && (
                    <Text style={styles.errorText}>{errors.area}</Text>
                  )}
                </View>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    No of People Sharing*
                  </Text>
                  <View style={{marginTop: 2, width: '100%'}}>
                    <TextInput
                      style={styles.InputText}
                      onChangeText={handleChange('peopleSharing')}
                      onBlur={handleBlur('peopleSharing')}
                      value={values.peopleSharing}
                      placeholder="No of people Sharing"
                      keyboardType="numeric"
                    />
                  </View>
                  {errors.peopleSharing && touched.peopleSharing && (
                    <Text style={styles.errorText}>{errors.peopleSharing}</Text>
                  )}
                </View>
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: 'grey',
                  paddingBottom: 20,
                }}>
                <View style={{marginTop: 15}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Ad title*
                  </Text>
                  <TextInput
                    style={styles.InputText}
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                    value={values.title}
                  />
                  <Text style={{fontSize: 13}}>
                    Mention the key feature of your property your are renting.
                  </Text>
                  {errors.title && touched.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}
                </View>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Ad Description*
                  </Text>
                  <TextInput
                    style={[styles.InputText, {textAlignVertical: 'top'}]} // Ensure text starts from the top
                    multiline={true} // This makes the input span multiple lines
                    rows={5}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    value={values.description}
                    placeholder="Describe the property you're renting"
                  />
                  {errors.description && touched.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>
                <View style={{marginTop: 20}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Location*
                  </Text>
                  <MyComponent childDataExtract={childDataExtract} />
                </View>
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: 'grey',
                  paddingBottom: 20,
                }}>
                <View style={{marginTop: 15}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Advance Price Paid*
                  </Text>
                  <TextInput
                    style={styles.InputText}
                    onChangeText={handleChange('advance')}
                    onBlur={handleBlur('advance')}
                    value={values.advance}
                    placeholder="Advance"
                    keyboardType="numeric"
                  />
                  <Text style={{fontSize: 13}}>
                    Advance you need for the property.
                  </Text>
                  {errors.advance && touched.advance && (
                    <Text style={styles.errorText}>{errors.advance}</Text>
                  )}
                </View>
                <View style={{marginTop: 15 , marginBottom:15}}>
                  <Text style={{fontSize: 14, fontWeight: 700, color: 'black'}}>
                    Monthly Rent*
                  </Text>
                  <TextInput
                    style={styles.InputText}
                    onChangeText={handleChange('rent')}
                    onBlur={handleBlur('rent')}
                    value={values.rent}
                    placeholder="Rent Per Month"
                    keyboardType="numeric"
                  />
                  <Text style={{fontSize: 13}}>
                    Monthly rent you need for the property.
                  </Text>
                  {errors.rent && touched.rent && (
                    <Text style={styles.errorText}>{errors.rent}</Text>
                  )}
                </View>
              </View>
              <View style={{marginVertical: 20}}>
                <Button
                  style={{
                    backgroundColor: '#0a8ed9',
                    fontFamily: 'Abel-Regular',
                  }}
                  onPress={() => {
                    console.log('Button Pressed');
                    handleSubmit();
                  }}
                  title="Add Property"
                />
              </View>
            </>
          )}
        </Formik>
        <Modal
          transparent={true}
          visible={showAlert}
          animationType="fade"
          onRequestClose={() => setIsPopupVisible(false)}>
          <AlertBox
            callFunction={toggleShowAlert}
            title={title}
            description={description}
            noCross={true}
          />
        </Modal>
        <Modal transparent={true} visible={loading} animationType="fade">
          <View style={styles.overlay}>
            <Loading />
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

export default AddProperty;

const styles = StyleSheet.create({
  selectedPropertyText: {
    color: 'white',
  },
  selectedPropertyItem: {
    backgroundColor: 'blue',
    color: 'white',
  },
  addImageContainer: {
    flexDirection: 'row',
    marginTop: 1,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  addImageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ebf1ff',
  },
  addImageIcon: {
    fontSize: 20,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  addImageText: {
    fontSize: 15,
    fontFamily: 'Abel-Regular',
  },
  marker: {
    width: 30,
    height: 30,
    backgroundColor: 'blue',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  PropertyContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  PropertyItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginHorizontal: 4,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    shadowColor: '#000',
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  PropertyIcon: {
    fontSize: 30,
    color: 'grey',
  },
  PropertyText: {
    fontSize: 12,
    fontFamily: 'Abel-Regular',
    color: 'black',
  },
  InputText: {
    borderRadius: 5,
    marginHorizontal: 5,
    marginTop: 5,
    borderWidth:1,
    marginBottom: 5,
    paddingLeft: 10,
    borderColor: 'grey',
    shadowColor: '#000',
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginLeft: 5,
    marginTop: 5,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
});
