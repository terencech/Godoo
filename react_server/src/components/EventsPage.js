import React, { Component } from 'react';
import $ from 'jquery';
import EventList from './EventList';
import Nav from './Nav';
import MapComponent from './MapComponent';
import SearchForm from './SearchForm';
import { default as canUseDOM } from "can-use-dom";


const geolocation = (
  canUseDOM && navigator.geolocation || {
    getCurrentPosition: (success, failure) => {
      failure( () => { console.log("ERROR ERROR ERROR") });
      success(() => {console.log("YAY YAY YAY") });
    },
  }
);


export default class EventsPage extends Component {

  constructor() {
    super();
    this.state = {
      events: [],
      selectedEventIDs: [],
      currentPosition: { lat: 49.2788, lng: -123.1139 } //default position...
    }
  }

  componentDidMount() {
    geolocation.getCurrentPosition((position) => {
      this.setState({currentPosition: {lat: position.coords.latitude, lng: position.coords.longitude} })
    });
    $.ajax({
      url: 'http://api.eventful.com/json/events/search',
      dataType: 'jsonp',
      data: {
        location: `${this.state.currentPosition.lat}, ${this.state.currentPosition.lng}`,
        app_key: 'pVnn7M9Sk54FkgBf', //FFmssWtvRRfc9VF7
        page_size: 100,
        date: "Today",
        within: 1,
        change_multi_day_start: true,
        include: 'categories',
        ex_category: 'learning_education,schools_alumni,conference,community,family_fun_kids,clubs_associations',
        category: 'comedy,food,music,festivals_parades,movies_film,fundraisers,art,support,holiday,books,attractions,business,singles_social,outdoors_recreation,performing_arts,animals,politics_activism,sales,science,religion_spirituality,sports,technology,other',
      },
      success: function(response) {
        function getRandomIntInclusive(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var results = response.events.event;
        console.log(results);
        this.setState(function(previousState) { 
          var randomEvent = results[getRandomIntInclusive(0, results.length)];

          return {
            events: results,
            selectedEventIDs: [randomEvent.id, ...previousState.selectedEventIDs]
          }
        });
      }.bind(this)
    });
  };

  handleMapMarkerClick(marker) {
    this.setState((previousState) => {
      var eventIdIndex = previousState.selectedEventIDs.indexOf(marker.id);
      if (eventIdIndex > -1) {
        previousState.selectedEventIDs.splice(eventIdIndex, 1);
      }
      return {selectedEventIDs: [marker.id, ...previousState.selectedEventIDs]}
    });
  }

  render() {
    console.log("selected events: ");
    console.log(this.state.selectedEventIDs);
    return (
      <div>
        <Nav />
        <div className="columns">
          <div className="column is-one-third">
            <SearchForm />
            <EventList
              events={this.state.events}
              selectedEventIDs={this.state.selectedEventIDs}
            />
          </div>
          <div className='column is-two-thirds' style={{height: "100%"}}>
            <MapComponent
              events={this.state.events}
              selectedEventIDs={this.state.selectedEventIDs}
              onMapMarkerClick={this.handleMapMarkerClick.bind(this)}
              defaultCenter={this.state.currentPosition}
            />
          </div>
        </div>
      </div>
    );
  }

}