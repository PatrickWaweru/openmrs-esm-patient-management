import React, { useEffect, useMemo, useState, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  DefinitionTooltip,
  Dropdown,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tabs,
  Tag,
  Tile,
} from '@carbon/react';
import { Add, Group, InProgress } from '@carbon/react/icons';
import { useLayoutType, navigate, showModal, interpolateUrl, isDesktop } from '@openmrs/esm-framework';
import {
  useVisitQueueEntries,
  useServices,
  QueueService,
  QueueStatus,
  MappedVisitQueueEntry,
  MappedQueuePriority,
  getOriginFromPathName,
} from './active-visits-table.resource';
import CurrentVisit from '../current-visit/current-visit-summary.component';
import PatientSearch from '../patient-search/patient-search.component';
import PastVisit from '../past-visit/past-visit.component';
import styles from './active-visits-table.scss';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface NameLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  from: string;
}

const PatientNameLink: React.FC<NameLinkProps> = ({ from, to, children }) => {
  const handleNameClick = (event: MouseEvent, to: string) => {
    event.preventDefault();
    navigate({ to });
    localStorage.setItem('fromPage', from);
  };

  return (
    <a onClick={(e) => handleNameClick(e, to)} href={interpolateUrl(to)}>
      {children}
    </a>
  );
};

function ActionsMenu({ patientUuid }: { patientUuid: string }) {
  const { t } = useTranslation();

  const launchEndVisitModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    <Layer>
      <OverflowMenu ariaLabel="Actions menu" selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#editPatientDetails"
          itemText={t('editPatientDetails', 'Edit patient details')}
          onClick={() =>
            navigate({
              to: `\${openmrsSpaBase}/patient/${patientUuid}/edit`,
            })
          }>
          {t('editPatientDetails', 'Edit patient details')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#setWaitTimeManually"
          itemText={t('setWaitTimeManually', 'Set wait time manually')}>
          {t('setWaitTimeManually', 'Set wait time manually')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#endVisit"
          onClick={launchEndVisitModal}
          hasDivider
          isDelete
          itemText={t('endVisit', 'End visit')}>
          {t('endVisit', 'End Visit')}
        </OverflowMenuItem>
      </OverflowMenu>
    </Layer>
  );
}

function StatusIcon({ status }) {
  switch (status as QueueStatus) {
    case 'Waiting':
      return <InProgress size={16} />;
    case 'In Service':
      return <Group size={16} />;
    default:
      return null;
  }
}

function ActiveVisitsTable() {
  const { t } = useTranslation();
  const { services } = useServices();
  const { visitQueueEntries, isLoading } = useVisitQueueEntries();
  const [filteredRows, setFilteredRows] = useState<Array<MappedVisitQueueEntry>>([]);
  const [filter, setFilter] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const layout = useLayoutType();

  const currentPathName: string = window.location.pathname;
  const fromPage: string = getOriginFromPathName(currentPathName);

  useEffect(() => {
    if (filter) {
      setFilteredRows(visitQueueEntries?.filter((entry) => entry.service === filter && /waiting/i.exec(entry.status)));
      setFilter('');
    }
  }, [filter, filteredRows, visitQueueEntries]);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 2,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 3,
        header: t('waitTime', 'Wait time (mins)'),
        key: 'waitTime',
      },
    ],
    [t],
  );

  const getTagType = (priority: string) => {
    switch (priority as MappedQueuePriority) {
      case 'Emergency':
        return 'red';
      case 'Not Urgent':
        return 'green';
      default:
        return 'gray';
    }
  };

  const buildStatusString = (status: QueueStatus, service: QueueService) => {
    if (!status || !service) {
      return '';
    }

    if (status === 'Waiting') {
      return `${status} for ${service}`;
    } else if (status === 'In Service') {
      return `Attending ${service}`;
    }
  };

  const tableRows = useMemo(() => {
    return (filteredRows.length ? filteredRows : visitQueueEntries)?.map((entry) => ({
      ...entry,
      name: {
        content: (
          <PatientNameLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`} from={fromPage}>
            {entry.name}
          </PatientNameLink>
        ),
      },
      priority: {
        content: (
          <>
            {entry?.priorityComment ? (
              <DefinitionTooltip className={styles.tooltip} align="bottom-left" definition={entry.priorityComment}>
                <Tag
                  role="tooltip"
                  className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                  type={getTagType(entry.priority as string)}>
                  {entry.priority}
                </Tag>
              </DefinitionTooltip>
            ) : (
              <Tag
                className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                type={getTagType(entry.priority as string)}>
                {entry.priority}
              </Tag>
            )}
          </>
        ),
      },
      status: {
        content: (
          <span className={styles.statusContainer}>
            <StatusIcon status={entry.status} />
            <span>{buildStatusString(entry.status, entry.service)}</span>
          </span>
        ),
      },
    }));
  }, [filteredRows, visitQueueEntries]);

  const handleServiceChange = ({ selectedItem }) => {
    setFilter(selectedItem);
  };

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        if (typeof filterableValue === 'boolean') {
          return false;
        }
        if (filterableValue.hasOwnProperty('content')) {
          if (Array.isArray(filterableValue.content.props.children)) {
            return ('' + filterableValue.content.props.children[1].props.children).toLowerCase().includes(filterTerm);
          }
          if (typeof filterableValue.content.props.children === 'object') {
            return ('' + filterableValue.content.props.children.props.children.props.children)
              .toLowerCase()
              .includes(filterTerm);
          }
          return ('' + filterableValue.content.props.children).toLowerCase().includes(filterTerm);
        }
        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (visitQueueEntries?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <span className={styles.heading}>{t('activeVisits', 'Active visits')}</span>
          <Button
            size="sm"
            kind="secondary"
            renderIcon={(props) => <Add size={16} {...props} />}
            onClick={() => setShowOverlay(true)}
            iconDescription={t('addPatientList', 'Add patient to list')}>
            {t('addPatientList', 'Add patient to list')}
          </Button>
        </div>
        <DataTable
          data-floating-menu-container
          filterRows={handleFilter}
          headers={tableHeaders}
          overflowMenuOnHover={isDesktop(layout) ? true : false}
          rows={tableRows}
          size="xs"
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar>
                <TableToolbarContent>
                  <div className={styles.filterContainer}>
                    <Dropdown
                      id="serviceFilter"
                      initialSelectedItem={'All'}
                      label=""
                      titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
                      type="inline"
                      items={['All', ...services]}
                      onChange={handleServiceChange}
                      size="sm"
                    />
                  </div>
                  <Layer>
                    <TableToolbarSearch
                      className={styles.search}
                      expanded
                      onChange={onInputChange}
                      placeholder={t('searchThisList', 'Search this list')}
                      size="sm"
                    />
                  </Layer>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.activeVisitsTable}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                    <TableExpandHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            <ActionsMenu patientUuid={tableRows?.[index]?.patientUuid} />
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 2}>
                            <>
                              <Tabs>
                                <Tab label={t('currentVisit', 'Current visit')}>
                                  <CurrentVisit
                                    patientUuid={tableRows?.[index]?.patientUuid}
                                    visitUuid={tableRows?.[index]?.visitUuid}
                                  />
                                </Tab>
                                <Tab label={t('previousVisit', 'Previous visit')}>
                                  <PastVisit patientUuid={tableRows?.[index]?.patientUuid} />
                                </Tab>
                              </Tabs>
                            </>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={() => setShowOverlay(true)}>
                      {t('addPatientToList', 'Add patient to list')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          )}
        </DataTable>
        {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} />}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <label className={styles.heading}>{t('activeVisits', 'Active visits')}</label>
        <Button
          iconDescription={t('addPatientToList', 'Add patient to list')}
          kind="secondary"
          onClick={() => setShowOverlay(true)}
          renderIcon={(props) => <Add size={16} {...props} />}
          size="sm">
          {t('addPatientList', 'Add patient to list')}
        </Button>
      </div>
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={(props) => <Add size={16} {...props} />}
            onClick={() => setShowOverlay(true)}>
            {t('addPatientToList', 'Add patient to list')}
          </Button>
        </Tile>
      </div>
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} />}
    </div>
  );
}

export default ActiveVisitsTable;
