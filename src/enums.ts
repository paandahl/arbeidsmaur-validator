export enum EntityType {
  Person = 1,
  Company = 2,
}

export enum FirstRefusalType { // forkjøpsrett
  None = 'none',
  SamePrice = 'samePrice',
  Standard = 'standard',
  Custom = 'custom',
}

export enum BoardRole {
  CeoChair = 'ceoChairman',
  Ceo = 'ceo',
  Chairman = 'chairman',
  DeputyChair = 'deputyChair',
  Member = 'member',
  AlternateMember = 'alternateMember',
}

export enum MeetingType {
  Board = 'board',
  AnnualMeeting = 'ordingGeneralForsamling',
  ExtraMeeting = 'ekstraOrdGeneralForsamling',
}

export enum MeetingItemType { // for saker i generalforsamling
  Ordinary = 'ordinary',
  Statutes = 'statutes',
  DividendRights = 'dividendRights',
  OwnerRights = 'ownerRights'
}

export enum MeetingRole {
  Shareholder = 'shareholder',
  MeetingLeader = 'meetingLeader',

  Chairman = 'chairman',
  DeputyChair = 'deputyChair',
  Member = 'member',
  AlternateMember = 'alternateMember',
}