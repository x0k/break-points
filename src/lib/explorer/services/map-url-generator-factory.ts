import {
  MapType,
  type IMapUrlGenerator,
  type IMapUrlGeneratorFactory,
} from '../core'

import {
  DoubleGisMapUrlGenerator,
  GoogleMapUrlGenerator,
  YandexMapUrlGenerator,
} from './map-url-generators'

const GENERATORS: Record<MapType, IMapUrlGenerator> = {
  [MapType.DoubleGis]: new DoubleGisMapUrlGenerator(),
  [MapType.Google]: new GoogleMapUrlGenerator(),
  [MapType.Yandex]: new YandexMapUrlGenerator(),
}

export class MapURLGeneratorFactory implements IMapUrlGeneratorFactory {
  create(type: MapType): IMapUrlGenerator {
    return GENERATORS[type]
  }
}
