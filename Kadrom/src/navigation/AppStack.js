import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // İkonlar için
import HomeScreen from '../screens/home/HomeScreen';
import { colors } from '../theme/colors';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateMatchScreen from '../screens/home/CreateMatchScreen';
import MatchDetailScreen from '../screens/home/MatchDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import RatePlayersScreen from '../screens/home/RatePlayersScreen';
import LeaderboardScreen from '../screens/home/LeaderboardScreen';

// Henüz yapmadığımız sayfalar için geçici placeholder
const Placeholder = () => <></>;

const Tab = createBottomTabNavigator();

const HomeStack = createNativeStackNavigator();
function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: colors.background }
        }}>
            <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Maç Planla' }} />
            <HomeStack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Maç Detayı' }} />
            <HomeStack.Screen name="RatePlayers" component={RatePlayersScreen} options={{ title: 'Değerlendirme' }} />
        </HomeStack.Navigator>
    );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text.primary,
            contentStyle: { backgroundColor: colors.background },
            headerShadowVisible: false // Çizgiyi kaldır
        }}>
            <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: '' }} />
        </ProfileStack.Navigator>
    );
}

export default function AppStack() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.secondary,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'football' : 'football-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Maçlar', headerShown: false }} />
            <Tab.Screen
                name="Leaderboard"
                component={LeaderboardScreen}
                options={{
                    title: 'Sıralama',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profilim', headerShown: false }} />
        </Tab.Navigator>
    );
}