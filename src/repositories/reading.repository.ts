import BaseRepository from "./base.repository";
import reading from "../models/reading.model";

class ReadingRepository extends BaseRepository {
  constructor() {
    super(reading);
  }
}

export default ReadingRepository;
