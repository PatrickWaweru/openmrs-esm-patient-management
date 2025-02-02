import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentsFetchResponse } from '../types';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useAppointmentDate } from '../helpers';

export function usePatientAppointmentHistory(patientUuid: string, abortController: AbortController) {
  const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;
  const startDate = useAppointmentDate();
  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: startDate,
      },
    });

  const { data, error, isValidating } = useSWR<AppointmentsFetchResponse, Error>(appointmentsSearchUrl, fetcher);

  const missedAppointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'Missed').length
    : 0;
  const completedAppointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'Completed').length
    : 0;
  const cancelledAppointments = data?.data?.length
    ? data.data.filter((appointment) => appointment.status === 'Cancelled').length
    : 0;
  const upcomingAppointments = data?.data?.length
    ? data.data?.filter((appointment: any) => dayjs((appointment.startDateTime / 1000) * 1000).isAfter(dayjs())).length
    : 0;

  return {
    appointmentsCount: { missedAppointments, completedAppointments, cancelledAppointments, upcomingAppointments },
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
