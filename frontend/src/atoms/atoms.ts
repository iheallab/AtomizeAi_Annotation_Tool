import { UserType } from '@/types';
import { atom } from 'jotai';

const isFirstTimeLoginAtom = atom(false);
const userAtom = atom<UserType>();

export { isFirstTimeLoginAtom, userAtom };
