import { Injectable } from '@angular/core';

@Injectable()
export class DbnameVersionService {
  private _dbNameVersionDict: Map<string, number> = new Map();

  set(dbName: string, version: number) {
    this._dbNameVersionDict.set(dbName, version);
  }

  getVersion(dbName: string) {
    return this._dbNameVersionDict.has(dbName) 
      ? this._dbNameVersionDict.get(dbName) 
      : -1;
  }
}
