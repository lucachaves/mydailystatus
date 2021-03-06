import React, { useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import router from 'next/router';
import auth0 from '../lib/auth0';
import { db } from '../lib/db';
import { distance } from '../lib/geo';

const Marker = ({ text }) => <div>{text}</div>;

const App = (props) => {
  useEffect(() => {
    if (!props.isAuth) {
      router.push('/');
    } else if (props.forceCreate) {
      router.push('/create-status');
    }
  }, []);

  if (!props.isAuth || props.forceCreate) {
    return null;
  }
  console.log();

  return (
    <div>
      <h1>App</h1>
      <p>Status próximos a você</p>
      <table className="border-collapse border-2 border-gray-500">
        <thead>
          <tr>
            <th className="border-collapse border-2 border-gray-500">Status</th>
            <th className="border-collapse border-2 border-gray-500">Coords</th>
            <th className="border-collapse border-2 border-gray-500">Dist</th>
          </tr>
        </thead>
        <tbody>
          {props.checkins.map((checkin) => (
            <tr key={checkin.id}>
              <td className="border-collapse border-2 border-gray-500">
                {checkin.status}
              </td>
              <td className="border-collapse border-2 border-gray-500">
                {`${checkin.coords.lat}, ${checkin.coords.long}`}
              </td>
              <td className="border-collapse border-2 border-gray-500">
                {checkin.distance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <pre>{JSON.stringify(props, null, 2)}</pre> */}
      <div className="py-4" style={{ height: '400px', width: '400px' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: props.coords.key }}
          defaultCenter={props.coords.center}
          defaultZoom={props.coords.zoom}
        >
          {props.checkins.map((checkin) => (
            <Marker
              key={checkin.id}
              lat={checkin.coords.lat}
              lng={checkin.coords.long}
              text={checkin.status}
            />
          ))}
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default App;

export async function getServerSideProps({ req, res }) {
  const session = await auth0.getSession(req);

  if (session) {
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const todaysCheckin = await db
      .collection('markers')
      .doc(currentDate)
      .collection('checks')
      .doc(session.user.sub)
      .get();
    const todaysData = todaysCheckin.data();
    let forceCreate = true;

    if (todaysData) {
      forceCreate = false;

      const checkins = await db
        .collection('markers')
        .doc(currentDate)
        .collection('checks')
        .near({
          center: todaysData.coordinates,
          radius: 1000,
        })
        .get();

      const checkinsList = [];

      checkins.docs.forEach((doc) => {
        checkinsList.push({
          id: doc.id,
          status: doc.data().status,
          coords: {
            lat: doc.data().coordinates.latitude,
            long: doc.data().coordinates.longitude,
          },
          distance: distance(
            todaysData.coordinates.latitude,
            todaysData.coordinates.longitude,
            doc.data().coordinates.latitude,
            doc.data().coordinates.longitude
          ).toFixed(2),
        });
      });

      return {
        props: {
          isAuth: true,
          user: session.user,
          coords: {
            center: {
              lat: todaysData.coordinates.latitude,
              lng: todaysData.coordinates.longitude,
            },
            zoom: 15,
            key: process.env.GOOGLE_MAPS_KEY,
          },
          forceCreate: false,
          checkins: checkinsList,
        },
      };
    }

    return {
      props: {
        isAuth: true,
        user: session.user,
        forceCreate,
      },
    };
  }

  return {
    props: {
      isAuth: false,
      user: {},
    },
  };
}
