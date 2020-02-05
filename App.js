import React from 'react';
import {StyleSheet, Text, View, TextInput, Button} from 'react-native';
import {Table, Row, Rows} from 'react-native-table-component';
import moment from "moment";

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            from: "",
            to: "Bülach",
            error: false,
            errorText: "",
            connections: [],
            tableHead: [],
            tableContent: [],
            station: null
        }
    }

    onChangeFrom = (text) => {
        this.setState({from: text})
    };

    onChangeTo = (text) => {
        this.setState({to: text})
    };

    searchConnections = () => {
        fetch("http://transport.opendata.ch/v1/connections?from=" + this.state.from + "&to=" + this.state.to)
            .then(response => response.json())
            .then(data => {
                this.mapTableData(data);
            }).catch(error => {
            console.log("err: ", error)
        });
    };

    findMe = () => {
        //Get coords, station and set state of 'From'
        //Search for connections
        navigator.geolocation.getCurrentPosition(
            position => {
                let url = "http://transport.opendata.ch/v1/locations?x=" + position.coords.latitude + "&y=" + position.coords.longitude;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                            //Get Closest Station where id is present
                            let closestStation = data.stations.find(station => station.id !== null);
                            this.setState({from: closestStation.name});
                            // this.searchConnections(closestStation.id, null)
                        },
                    )
                    .catch(error => console.log("couldn't get Location")
                    )
            });
    };

    mapTableData = (data) => {
        let tableHead = ["Gleis", "Abfahrt", "Ankunft", "Dauer"];
        let connections = data.connections;
        let tableContent = connections.map((conn) => {
            return [conn.from.platform ? conn.from.platform : "-", moment(conn.from.departure).format('hh:mm'), moment(conn.to.arrival).format('hh:mm'), this.getDuration(conn.duration)]
        });

        this.setState({
            tableContent: tableContent,
            tableHead: tableHead,
            connections: data.connections,
            error: false,
            errorText: ""
        })
    };

    getDuration = (durationStr) => {
        let noDays = durationStr.split("d")[1];
        let parts = noDays.split(":");
        let hours = parts[0];
        let mins = parts[1];
        let result;
        if (parseInt(hours) === 0) {
            result = mins + " min";
        } else {
            result = hours.substr(1, 2) + " h " + mins + " min"
        }
        return result;
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.title1}>SBB-Fahrplan</Text>
                <Text style={styles.title2}>Verbindung Suchen</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input1}
                        editable
                        placeholder="From"
                        onChangeText={this.onChangeFrom}
                        value={this.state.from}
                    />
                    <Button onPress={this.findMe} title={"locate me"}/>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input1}
                        editable
                        placeholder="To"
                        onChangeText={this.onChangeTo}
                        value={this.state.to}
                    />
                    <Button onPress={this.searchConnections} title="Search"/>
                </View>
                {this.state.error && <Text style={styles.error}>{this.state.errorText}</Text>}
                {this.state.tableContent.length > 0 &&
                <View style={styles.tableContainer}>
                    <Table borderStyle={{borderWidth: 0, borderColor: 'white'}}>
                        <Row data={this.state.tableHead} style={styles.head} textStyle={styles.textHead}/>
                        <Rows data={this.state.tableContent} textStyle={styles.text}/>
                    </Table>
                </View>}
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'red',
        flexDirection: "column",
        paddingTop: 40,
        paddingLeft: 20,
        paddingRight: 20
    },
    title1: {
        color: "white",
        fontSize: 40,
    },
    title2: {
        color: "white",
        fontSize: 20,
        paddingTop: 20
    },
    input1: {
        height: 30,
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: "white",
        marginTop: 20,
        width: "70%",
    },
    inputContainer: {
        flex: 1,
        flexDirection: "row",
        maxHeight: 50,
        alignItems: "center"
    },
    error: {
        color: "white",
        fontSize: 30
    },
    head: {
        height: 40,
        backgroundColor: 'lightgrey'
    },
    text: {
        margin: 6,
        color: "white"
    },
    textHead: {
        margin: 8,
        color: "black"
    },
    tableContainer: {
        paddingTop: 20,
    },


});