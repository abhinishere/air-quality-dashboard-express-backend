// common operations for every document

class BaseRepository {
  collection: any;
  constructor(_collection: any) {
    this.collection = _collection;
  }
  async findAll() {
    var data = await this.collection.find().lean().exec();
    return data;
  }
  async findById(id: string) {
    return this.collection.findById(id);
  }
  async create(model: any) {
    return this.collection.create(model);
  }
  async update(model: any) {
    return this.collection.findByIdAndUpdate(model._id, model);
  }
  async deleteById(id: string) {
    return this.collection.findByIdAndDelete(id);
  }
}

export default BaseRepository;
