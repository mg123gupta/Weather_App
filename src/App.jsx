
import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';

const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

const WeatherDisplay = ({ data }) => {
    const { name, main, weather, sys } = data;
    const { description, icon } = weather[0];
    const { country } = sys;
    const iconUrl = `https://openweathermap.org/img/w/${icon}.png`;

    return (
        <div className="weather-display">
            <div style={{
                display: 'grid',
                gap: '8px',
                padding: '10px',
            }}>
                <img src={iconUrl} className='weather-icon' alt="Weather Icon" />
                <p className="weather-temperature">
                    {(main.temp - 273.15).toFixed(2)} °C
                </p>
                <p>{description}</p>
                <p >
                    {name}, {country}
                </p>
            </div>
            <div className="weather-extra-info">
                <div className="weather-info-box" style={{ borderRight: '1px solid #c5c5c5' }}>
                    <img width="35px" alt="temp" src="https://www.freeiconspng.com/thumbs/temperature-icon-png/temperature-icon-png-1.png" />
                    <div className="weather-info-details">
                        <span className="weather-info-value">
                            {(main.temp - 273.15).toFixed(2)} °C
                        </span>
                        <span className="weather-info-label">Feels Like</span>
                    </div>
                </div>
                <div className="weather-info-box">
                    <img width="25px" alt="Humidity" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmw0oUDW4h7IKU8urgFxuqpOerET4UaxYUfA&usqp=CAU" />
                    <div className="weather-info-details">
                        <span className="weather-info-value">{main.humidity}%</span>
                        <span className="weather-info-label">Humidity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WeatherCard = ({ city, latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchWeatherData = async (url) => {
        setLoading(true);
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === 200) {
                setWeatherData(data);
            }
            else {
                setWeatherData(null);
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (city) {
            handleCitySubmit();
            return;
        }
        if (latitude && longitude) {
            handleLocationSubmit();
            return;
        }
    }, [city, latitude, longitude])

    const handleCitySubmit = () => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
        fetchWeatherData(url);
    };

    const handleLocationSubmit = () => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        fetchWeatherData(url);
    };

    return (
        <div>
            <h1 className='app-header'>
                <button onClick={() => navigate('/')} style={{
                    rotate: "-180deg",
                    cursor: 'pointer'
                }}>
                    ⮕
                </button>
                Weather App</h1>
            {loading ? <p className='loading-text'>Loading...</p> :
                <div>
                    {
                        (weatherData ?
                            <WeatherDisplay data={weatherData} />
                            : <p className='loading-text'>No data found</p>)
                    }
                </div>
            }
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [city, setCity] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false)

    const fetchLocationSubmit = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                navigate(`/?latitude=${latitude}&longitude=${longitude}`);
                setLoadingLocation(false);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert(`Geolocation permission was denied. You can grant permission and reload the page to try again.`);
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    alert(`Geolocation information is unavailable. Please check your device's location settings.`);
                } else if (error.code === error.TIMEOUT) {
                    alert(`Geolocation request timed out. Please try again.`);
                } else {
                    alert(`An error occurred while fetching geolocation. Please try again.`);
                }
                setLoadingLocation(false);
            }
        );
    };

    return (
        <div className="app">
            <h1 className="home-header">Weather App</h1>
            <div style={{
                padding: '15px',
                display: 'grid',
                gap: '12px'
            }}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    navigate(`/?city=${city}`);
                }}>
                    <input
                        className='input-container'
                        type="text"
                        placeholder="Enter city name"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </form>
                <div className='or-divider'>
                    <hr />
                    <span className='or-text'>or</span>
                </div>

                <button
                    className='get-weather-button'
                    onClick={() => {
                        setLoadingLocation(true);
                        fetchLocationSubmit();
                    }}>{loadingLocation ? 'Fetching Your Location...' : 'Get Weather'}</button>
            </div>
        </div>
    );
};

const RenderScreens = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const city = searchParams.get('city') || null;
    const latitude = searchParams.get('latitude') || null;
    const longitude = searchParams.get('longitude') || null;

    if (city) {
        return <WeatherCard city={city} />;
    }
    if (latitude && longitude) {
        return <WeatherCard latitude={latitude} longitude={longitude} />;
    }

    return <Home />;
}

const App = () =>
    <Router>
        <div className="container">
            <div className="card">
                <Routes>
                    <Route
                        index
                        element={<RenderScreens />}
                    />
                </Routes>
            </div>
        </div>
    </Router>

export default App;