import BaseRepository from "./base.repository";
import auth from "../models/auth.model";

class AuthRepository extends BaseRepository {
  constructor() {
    super(auth);
  }
}

export default AuthRepository;
