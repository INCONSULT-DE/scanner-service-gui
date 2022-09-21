import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, MarqueeSelection, Selection, } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';

import configData from "../config.json";
import ISimilarityCalculation from '../models/ISimilarityCalculation';

export default class SimilarityCalculationList extends React.Component<any, any> {

    private _columns = [
        { key: 'column1', name: 'ID', fieldName: 'id', minWidth: 50, maxWidth: 75, isResizable: true },
        { key: 'column2', name: 'Child Context ID', fieldName: 'child_context_id', minWidth: 50, maxWidth: 100, isResizable: true },
        { key: 'column3', name: 'Parent Context ID', fieldName: 'parent_context_id', minWidth: 50, maxWidth: 100, isResizable: true },
        { key: 'column4', name: 'Status', fieldName: 'status', minWidth: 50, maxWidth: 100, isResizable: true },
        { key: 'column5', name: 'Created', fieldName: 'created', minWidth: 200, maxWidth: 700, isResizable: true },
        { key: 'column6', name: 'Modified', fieldName: 'modified', minWidth: 200, maxWidth: 700, isResizable: true },
        { key: 'column7', name: 'Creation Type', fieldName: 'creation_type', minWidth: 100, maxWidth: 500, isResizable: true },
        { key: 'column8', name: 'Threshold', fieldName: 'threshold', minWidth: 100, maxWidth: 150, isResizable: true },
    ];

    private _selection = new Selection({
        onSelectionChanged: () => this.setState({ selectionDetails: "demo" }),
    });

    public state = {
        error: false,
        errorMessage: "",
        loading: false,
        similarityCalculations: new Array<ISimilarityCalculation>(),
        selectionDetails: ""
    };

    public componentDidMount() {
        this.loadSimilarityCalculations();
    }

    private async loadSimilarityCalculations() {
        this.setState({ loading: true });

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        };

        fetch(configData.SERVER_URL + '/similarity_calculation?limit=0', requestOptions)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        this.props.timedOutSession();
                    }
                    else {
                        console.error(response);
                        this.setState({ loading: true, });
                    }
                } else {
                    const similarityCalculations = new Array<ISimilarityCalculation>();
                    data.data.forEach((similarityCalculation: any) => {
                        similarityCalculations.push({
                            id: similarityCalculation.id,
                            child_context_id: similarityCalculation.child_context_id,
                            parent_context_id: similarityCalculation.parent_context_id,
                            status: similarityCalculation.status,
                            created: similarityCalculation.created,
                            modified: similarityCalculation.modified,
                            creation_type: similarityCalculation.creation_type,
                            threshold: similarityCalculation.threshold,
                        })
                    });

                    this.setState({
                        similarityCalculations: similarityCalculations,
                        loading: false
                    });
                }
            })
            .catch(error => {
                console.error(error);
                this.props.onErrorHappened();
                this.setState({ loading: true, });
            });

    }

    public render() {
        return (
            <div style={{
                width: "100%",
                backgroundColor: NeutralColors.white,
                boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
                padding: 5,
                margin: 5,
            }}>
                <MarqueeSelection selection={this._selection}>
                    <DetailsList
                        items={this.state.similarityCalculations}
                        columns={this._columns}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.justified}
                        selection={this._selection}
                        selectionPreservedOnEmptyClick={true}
                        ariaLabelForSelectionColumn="Toggle selection"
                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                        checkButtonAriaLabel="select row"
                    />
                </MarqueeSelection>
            </div>
        );
    }
};
