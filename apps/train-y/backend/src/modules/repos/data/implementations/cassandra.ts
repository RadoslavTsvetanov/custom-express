import * as moment from 'moment';
import { Event, event } from '../../../../db/cassandra/main';
import { Idata } from '../interface';
import { timeQuery } from '../../../../types/timeQuery';

export class CassandraDataRepo implements Idata{
  async save(e: Event) {
    try {
      const eventData = new event({
        start_timestamp: moment(e.start_timestamp).toDate(),
        end_timestamp: moment(e.end_timestamp).toDate(),
        content: e.content,
      });

      await eventData.save();
      console.log('Data saved to Cassandra:', eventData);
    } catch (error) {
      console.error('Error saving to Cassandra:', error);
    }
  }

  async get(query: timeQuery) {
        try {
    const start = new Date(query.start);
    const end = new Date(query.end);

    const results = await Event.findAsync({
      start_timestamp: start,
      end_timestamp: end,
    });

    console.log(`Found ${results.length} event(s) for start=${start.toISOString()} and end=${end.toISOString()}`);
    return results;
  } catch (error) {
    console.error('Error retrieving from Cassandra:', error);
    return [];
  }
  }

  // You can extend this with methods to retrieve data if needed
}