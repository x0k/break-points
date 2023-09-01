import type { GeoLocation } from './geo-location'

const BASE = 'https://geocode-maps.yandex.ru/1.x?format=json&'

export enum ToponymKind {
  House = 'house', // дом;
  Street = 'street', // улица;
  Metro = 'metro', // станция метро;
  District = 'district', // район города;
  Locality = 'locality', // населенный пункт (город/поселок/деревня/село)
}

export interface SearchByAddressOptions {
  address: string
  searchLocationCenter?: GeoLocation
}

export interface SearchByLocationOptions {
  location: GeoLocation
  toponymKind?: ToponymKind
}

export enum ResonseToponymKind {
  House = 'house', // отдельный дом Россия, Москва, улица Тверская, 7
  Street = 'street', // улица Россия, Москва, улица Тверская
  Metro = 'metro', // станция метро Россия, Москва, Филевская линия, метро Арбатская
  District = 'district', //район города Россия, Москва, Северо-Восточный административный округ
  Locality = 'locality', // населённый пункт: город / поселок / деревня / село и т. п. Россия, Санкт-Петербург
  Area = 'area', // район области Россия, Ленинградская область, Выборгский район
  Province = 'province', // область Россия, Нижегородская область
  Country = 'country', // страна Великобритания
  Region = 'region', // устаревший тип, не используется
  Hydro = 'hydro', // река / озеро / ручей / водохранилище и т. п. Россия, река Волга
  RailwayStation = 'railway_station', // ж.д. станция Россия, Москва, Курский вокзал
  Station = 'station', // станции, не относящиеся к железной дороге. Например, канатные станции. Россия, Москва, Московская канатная дорога, станция Новая Лига
  Route = 'route', // линия метро / шоссе / ж.д. линия Россия, Центральный федеральный округ, Ярославское направление
  Vegetation = 'vegetation', // лес / парк / сад и т. п. Россия, Санкт-Петербург, Михайловский сад
  Airport = 'airport', // аэропорт Россия, Московская область, аэропорт Домодедово
  Entrance = 'entrance', // подъезд / вход Россия, Москва, улица Льва Толстого, 16, подъезд 5
  Other = 'other', // прочее Россия, Свердловская область, Екатеринбург, Шабур остров
}

export interface AddressComponent {
  kind: ResonseToponymKind
  name: string
}

export interface ResponseAddress {
  country_code: string // — код страны в формате ISO 3166-1.
  postal_code: string // — почтовый индекс
  formatted: string // — адрес топонима в одной строке
  Components: AddressComponent[] // — разбитый на компоненты адрес топонима. Компоненты представлены парой значений kind и name и организованы по убыванию, от самого крупного к самому маленькому (например, от страны к дому).
}

export interface ResponseFeature {
  GeoObject: {
    metaDataProperty: {
      GeocoderMetaData: {
        kind: ResonseToponymKind
        text: string
        precision: string // enum
        Address: ResponseAddress
        // Deprecated
        // AddressDetails: any
      }
    }
    description: string
    name: string
    boundedBy: {
      Envelope: {
        lowerCorner: string
        upperCorner: string
      }
    }
    Point: {
      pos: string
    }
    uri?: string
  }
}

export interface SearchResponse {
  response: {
    GeoObjectCollection: {
      metaDataProperty: {
        GeocoderResponseMetaData: {
          request: string
          found: string
          results: string
        }
      }
      featureMember: ResponseFeature[]
    }
  }
}

export class YandexGeocodeAPI {
  constructor(private apiKey: string) {}

  searchByAddress = async ({
    address,
    searchLocationCenter,
  }: SearchByAddressOptions): Promise<SearchResponse> => {
    const llParameter = searchLocationCenter
      ? `&ll=${searchLocationCenter.longitude},${searchLocationCenter.latitude}`
      : ''
    return fetch(
      `${BASE}geocode=${encodeURIComponent(address)}&apikey=${
        this.apiKey
      }${llParameter}`
    ).then((response) => response.json())
  }

  searchByLocation = async ({
    location,
    toponymKind,
  }: SearchByLocationOptions): Promise<SearchResponse> => {
    const kindParameter = toponymKind ? `&kind=${toponymKind}` : ''
    return fetch(
      `${BASE}geocode=${location.longitude},${location.latitude}&apikey=${this.apiKey}${kindParameter}`
    ).then((response) => response.json())
  }
}
