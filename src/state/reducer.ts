import { State } from './state';
import { Patient, Diagnosis } from '../types';

export type Action =
  | {
      type: 'SET_PATIENT_LIST';
      payload: Patient[];
    }
  | {
      type: 'ADD_PATIENT';
      payload: Patient;
    }
  | {
      type: 'SET_DIAGNOSIS_LIST';
      payload: Diagnosis[];
    }
  | {
      type: 'UPDATE_PATIENT';
      payload: Patient;
    };

export const setPatientList = (payload: Patient[]): Action => ({
  type: 'SET_PATIENT_LIST',
  payload,
});

export const setDiagnosisList = (payload: Diagnosis[]): Action => ({
  type: 'SET_DIAGNOSIS_LIST',
  payload,
});

export const updatePatient = (payload: Patient): Action => ({
  type: 'UPDATE_PATIENT',
  payload,
});

export const addPatient = (payload: Patient): Action => ({
  type: 'ADD_PATIENT',
  payload,
});

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PATIENT_LIST':
      return {
        ...state,
        patients: {
          ...action.payload.reduce(
            (memo, patient) => ({ ...memo, [patient.id]: patient }),
            {},
          ),
          ...state.patients,
        },
      };
    case 'SET_DIAGNOSIS_LIST':
      return {
        ...state,
        diagnoses: action.payload,
      };
    case 'ADD_PATIENT':
      return {
        ...state,
        patients: {
          ...state.patients,
          [action.payload.id]: action.payload,
        },
      };
    case 'UPDATE_PATIENT': {
      const patientToUpdate = state.patients[action.payload.id];
      if (!patientToUpdate) return { ...state };
      return {
        ...state,
        patients: {
          ...state.patients,
          [action.payload.id]: action.payload,
        },
      };
    }
    default:
      return state;
  }
};
