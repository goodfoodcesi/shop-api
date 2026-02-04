export interface UserCreatedEvent {
  eventType: 'user.created';
  userId: string;
  email: string;
  name: string;
  roles: string[];
  timestamp: string;
}

export interface UserRoleChangedEvent {
  eventType: 'user.role_changed';
  userId: string;
  newRole: string;
  allRoles: string[];
  timestamp: string;
}

export type DomainEvent = UserCreatedEvent | UserRoleChangedEvent;