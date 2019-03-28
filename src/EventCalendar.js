// @flow
import {
    VirtualizedList,
    View,
    TouchableOpacity,
    Image,
    Text,
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';

import styleConstructor from './style';

import DayView from './DayView';

export default class EventCalendar extends React.Component {
    constructor(props) {
        super(props);

        const start = props.start ? props.start : 0;
        const end = props.end ? props.end : 24;

        this.styles = styleConstructor(props.styles, (end - start) * 150);
        this.state = {
            date: moment(this.props.initDate),
            index: this.props.size,
        };
    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this);
        }
    }

    componentWillUnmount() {
        if (this.props.onRef) {
            this.props.onRef(undefined);
        }
    }

    static defaultProps = {
        size: 30,
        initDate: new Date(),
        formatHeader: 'DD MMMM YYYY',
        showHeaderArrows: true,
    };

    _getItemLayout(data, index) {
        const { width } = this.props;
        return { length: width, offset: width * index, index };
    }

    _getItem(events, index) {
        const date = moment(this.props.initDate).add(
            index,
            'days'
        );
        return _.filter(events, event => {
            const eventStartTime = moment(event.start);
            return (
                eventStartTime >= date.clone().startOf('day') &&
                eventStartTime <= date.clone().endOf('day')
            );
        });
    }

    _renderItem({ index, item }) {
        const {
            width,
            format24h,
            initDate,
            scrollToFirst = true,
            start = 0,
            end = 24,
            formatHeader,
            upperCaseHeader = false,
        } = this.props;
        const date = moment(initDate).add(index, 'days');

        const leftIcon = this.props.headerIconLeft ? (
            this.props.headerIconLeft
        ) : (
            <Image source={require('./back.png')} style={this.styles.arrow} />
        );
        const rightIcon = this.props.headerIconRight ? (
            this.props.headerIconRight
        ) : (
            <Image source={require('./forward.png')} style={this.styles.arrow} />
        );

        let headerText = upperCaseHeader
            ? date.format(formatHeader || 'DD MMMM YYYY').toUpperCase()
            : date.format(formatHeader || 'DD MMMM YYYY');

        return (
            <View style={[this.styles.container, { width }]}>
                <View style={this.styles.header}>
                  {this.props.showHeaderArrows ?
                    <TouchableOpacity
                      style={this.styles.arrowButton}
                      onPress={this._previous}
                    >
                      {leftIcon}
                    </TouchableOpacity>
                    :
                    null
                  }
                    <TouchableOpacity
                        onPress={this.props.calendarTapped}
                        style={this.styles.headerTouchableContainer}
                    >
                        <View style={this.styles.headerTextContainer}>
                            <Text style={this.styles.headerText}>{headerText}</Text>
                        </View>
                    </TouchableOpacity>
                  {this.props.showHeaderArrows ?
                    <TouchableOpacity
                      style={this.styles.arrowButton}
                      onPress={this._next}
                    >
                      {rightIcon}
                    </TouchableOpacity>
                    :
                    null
                  }
                </View>
                <DayView
                    date={date}
                    index={index}
                    format24h={format24h}
                    formatHeader={this.props.formatHeader}
                    headerStyle={this.props.headerStyle}
                    renderEvent={this.props.renderEvent}
                    eventTapped={this.props.eventTapped}
                    events={item}
                    width={width}
                    styles={this.styles}
                    scrollToFirst={scrollToFirst}
                    start={start}
                    end={end}
                />
            </View>
        );
    }

    _goToPage(index) {
        if (index <= 0 || index >= this.props.size * 2) {
            return;
        }
        const date = moment(this.props.initDate).add(
            index - this.props.size,
            'days'
        );
        this.refs.calendar.scrollToIndex({ index, animated: false });
        this.setState({ index, date });
    }

    _goToDate(date) {
        console.log(date)
        const index = moment(date);
        this._goToPage(index);
    }

    _previous = () => {
        const date = moment(this.props.initDate).subtract(1, 'days').format('YYYY-MM-DD');
        this.props.renderDayCallback(date);
        this._goToDate(date);
    };

    _next = () => {
        const date = moment(this.props.initDate).add(1, 'days').format('YYYY-MM-DD');
        this.props.renderDayCallback(date);
        this._goToDate(date);
    };

    render() {
        const {
            width,
            virtualizedListProps,
            events,
            initDate,
        } = this.props;

        return (
            <View style={[this.styles.container, { width }]}>
                <VirtualizedList
                    ref="calendar"
                    windowSize={1}
                    initialNumToRender={1}
                    initialScrollIndex={this.props.size - 1}
                    data={events}
                    getItemCount={() => this.props.size}
                    getItem={this._getItem.bind(this)}
                    keyExtractor={(item, index) => index.toString()}
                    getItemLayout={this._getItemLayout.bind(this)}
                    horizontal
                    pagingEnabled
                    renderItem={this._renderItem.bind(this)}
                    style={{ width: width }}
                    onMomentumScrollEnd={event => {
                        const index = parseInt(event.nativeEvent.contentOffset.x / width);
                        const date = moment(this.props.initDate).add(
                            index,
                            'days'
                        );
                        if (this.props.dateChanged) {
                            this.props.dateChanged(date.format('YYYY-MM-DD'));
                        }
                        this.setState({ index, date });
                    }}
                    {...virtualizedListProps}
                />
            </View>
        );
    }
}
