import {
	magnetometer,
	SensorTypes,
	setUpdateIntervalForType,
} from "react-native-sensors";
import { useEffect, useState } from "react";

export const useNavigationHeading = () => {
	const [heading, setHeading] = useState(0);

	useEffect(() => {
		setUpdateIntervalForType(SensorTypes.magnetometer, 2000);

		const degree = ({ x, y }) => {
			let angle = Math.atan2(y, x) * (180 / Math.PI);
			angle = angle >= 0 ? angle : 360 + angle;
			return angle;
		};

		const subscription = magnetometer.subscribe(
			({ x, y, z }) => {
				const angle = degree({ x, y });
				setHeading(angle);
			},
			(error) => {
				console.warn("Magnetometer error: ", error);
			}
		);

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return heading;
};
