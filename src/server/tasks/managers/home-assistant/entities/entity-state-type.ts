export type HAEntityState = {
  entity_id: string;
  state: string;
  attributes: Attributes;
  last_changed: string;
  last_updated: string;
  context: Context;
};

type Attributes = {
  state_class: string;
  unit_of_measurement: string;
  device_class: string;
  friendly_name: string;
};

type Context = {
  id: string;
  parent_id: any;
  user_id: any;
};
