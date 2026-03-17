import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { DarkHeader, Icons } from "../../components";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import { getIncidentTypeListRequest } from "./redux/Action";
import ManualIncidentSkeleton from "../../components/LoaderComponents/ManualIncidentSkeleton";
import { deviceWidth } from "../../utils/DeviceInfo";
import ProgressLoader from "react-native-progress/Bar";
import ComponentStyles from "../../styles/ComponentStyles";
import FontFamily from "../../assets/fonts/FontFamily";

const IncidentListScreen = (props) => {
	const dispatch = useDispatch();
	const savedDraft = props.route.params?.savedDraft;

	const isLoading = useSelector((state) => state.Incident.isLoading);
	const incidentTypes = useSelector(
		(state) => state.Incident.incidentTypes?.data
	);

	const [isDraftLoading, setIsDraftLoading] = useState(false);

	useEffect(() => {
		const param = {
			status: "approved",
		};
		dispatch(getIncidentTypeListRequest(param, props.navigation));
	}, []);

	useEffect(() => {
		const getSavedDraftData = () => {
			if (!savedDraft || !incidentTypes?.incident_data) return;

			setIsDraftLoading(true);

			const draftIncident = incidentTypes.incident_data.find(
				(incident) => incident.id === savedDraft.incident_type_id
			);

			setTimeout(() => {
				setIsDraftLoading(false);

				props.navigation.navigate("ManualQuestion", {
					incidentData: draftIncident,
					draftData: savedDraft,
				});
			}, 2000);
		};

		getSavedDraftData();
	}, [incidentTypes]);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const renderIncidentList = (item, index) => {
		return (
			<TouchableOpacity
				onPress={() => {
					props.navigation.navigate("ManualQuestion", { incidentData: item });
				}}
			>
				<View style={[IncidentStyle.incidentListView]}>
					<View style={[IncidentStyle.incidentNameIcon]}>
						<Icons
							iconName={item.iconName}
							iconSetName={item.iconType}
							iconColor={Colors.iconGray}
							iconSize={parseInt(item.iconSize)}
						/>
						<Text style={[IncidentStyle.incidentLable]}>{item.name}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};
	const SavedDraftLoader = () => (
		<View style={[ComponentStyles.defaultLoader]} pointerEvents={"auto"}>
			<View style={IncidentStyle.progressCard}>
				<Text
					style={{
						marginBottom: 10,
						color: Colors.primary,
						fontFamily: FontFamily.PoppinsSemiBold,
					}}
				>
					{`Restore your saved Draft data`}
				</Text>
				<ProgressLoader
					width={deviceWidth / 1.4}
					height={10}
					borderWidth={0}
					borderRadius={8}
					color={Colors.secondary}
					borderColor={"#e0e0e0"}
					unfilledColor={"#e0e0e0"}
					indeterminate
					indeterminateAnimationDuration={2000}
				/>
			</View>
		</View>
	);

	return (
		<View style={[IncidentStyle.mainContainer]}>
			{isDraftLoading && <SavedDraftLoader />}
			<DarkHeader
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				onPress={() => gotoBack()}
			/>
			<View
				style={[
					IncidentStyle.backgroundColorBlue,
					IncidentStyle.paddingFormContainer,
				]}
			>
				{isLoading ? (
					<FlatList
						data={Array(6).fill(0)}
						keyExtractor={(item, index) => `skeleton-${index}`}
						renderItem={({ item, index }) => <ManualIncidentSkeleton />}
					/>
				) : (
					<>
						<Text style={[IncidentStyle.darkBlackText]}>
							{incidentTypes?.white_label
								? incidentTypes?.white_label
								: "What Type of Incident are you "}
							<Text style={[IncidentStyle.lightText]}>
								{incidentTypes?.grey_label
									? ` ${incidentTypes?.grey_label}`
									: "reporting?"}
							</Text>
						</Text>
						<FlatList
							style={{}}
							data={
								incidentTypes?.incident_data ? incidentTypes?.incident_data : []
							}
							renderItem={({ item: incidentList, index }) =>
								renderIncidentList(incidentList, index)
							}
							keyExtractor={(item, index) => `questions-${index}`}
							showsVerticalScrollIndicator={false}
						/>
					</>
				)}
			</View>
		</View>
	);
};

export default IncidentListScreen;
