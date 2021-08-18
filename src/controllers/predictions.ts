export {};

import express from 'express';
import PredictedRoadTypes from '../models/predictedRoadTypes';

import {
    Tensor4D,
    tensor4d,
    Tensor,
    loadLayersModel,
    Rank,
    LayersModel
} from '@tensorflow/tfjs-node';
import {
    getTracksMapByCity,
    sampleTracksByCity
} from './tracks';
import {
    tap,
    map,
    switchMap
} from 'rxjs/operators';
import { 
    from,
    Observable,
    of
} from 'rxjs';
import {
    IAccelerometer,
    ISumarizedObject,
    ISumarizingObject,
    TensorSample
} from '../interfaces/Track';
import {
    tensorSample
} from './mocks';

interface PredictionType {
    id: number;
    description: string;
};

enum modelPaths  {
    roads ='file://src/assets/tensorFlowCore/roads/model.json',
    anomalies = 'file://src/assets/tensorFlowCore/anomalies/model.json',
};

class PredictionTypes {

    private roadTypes: PredictionType[] = [
        {
            id: 0,
            description: 'Asphalt'
        },
        {
            id: 1,
            description: 'Cobbles'
        },
        {
            id: 2,
            description: 'Concrete'
        },
        {
            id: 3,
            description: 'Earth'
        }
    ];

    private anomalyTypes: PredictionType[] = [
        {
            id: 0,
            description: 'Call'
        },
        {
            id: 1,
            description: 'Door'
        },
        {
            id: 2,
            description: 'Message'
        },
        {
            id: 3,
            description: 'Pothole'
        },
        {
            id: 4,
            description: 'Speed Bump'
        },
        {
            id: 5,
            description: 'Street Gutter'
        }
    ];

    public getRoadType(id: number): PredictionType {
        return this.roadTypes.find((item: PredictionType) => item.id === id);
    }

    public getAnomalyType(id: number): PredictionType {
        return this.anomalyTypes.find((item: PredictionType) => item.id === id);
    }
}

export const predictRoadsCallback = (req: express.Request, res: express.Response): void => {
    console.log('\n'.repeat(20));
    console.log('----------------');
    console.log('PREDECIR SUELOS');
    console.log('----------------');
    
    // TODO: añadir soporte para filtrado en getTracksMapByCity()
    // TODO: agregar filtrado por campo req.body.linkedCities

    getTracksMapByCity('cityId startTime ranges accelerometers')
        .pipe(
            map((allData: ISumarizingObject[]) => sampleTracksByCity(allData)),
            switchMap((predictions: ISumarizedObject[]) => {
                predictions.map((p: ISumarizedObject) => {
                });
                return of(predictions)
            }),
            switchMap((predictions: ISumarizedObject[]) => replacePredictions(predictions))
        )
        .subscribe((result: any) => {
            res.status(200).send(result);
            res.end();
        }, (error: Error) => {
            console.error(error);
            res.status(500).send(error);
            res.end();
        });

    /* predictSample(tensorSample)
    .then(response => {
        res.send(response);
    }, error => {
        console.error(error);
        res.send(error);
    }); */
}

const predictSample = (model: LayersModel, sample: any): any => {
    const tensor: Tensor4D = tensor4d(sample);
    const result: Tensor<Rank> = model.predict(tensor) as Tensor;
    return result.dataSync();
}

//? The model is loaded only once for the entire prediction
const loadModel = (path: string): Promise<LayersModel | Error> =>
    loadLayersModel(path)
    .catch((error: any) => new Error(error))

const removePredictions = (): Promise<Error | any> =>
    PredictedRoadTypes.deleteMany({})
        .catch((error: any) => new Error(error));

const insertPredictions = (values: any): Promise<Error | any> =>
    PredictedRoadTypes.insertMany(values)
        .catch((error: any) => new Error(error));

const replacePredictions = (values: any): Observable<Error | any> =>
    from(removePredictions())
    .pipe(
        switchMap((res: any) => insertPredictions(values))
    );

export const getTensorSample = (a?: IAccelerometer): TensorSample =>
    a ? [
        [a.x.raw],
        [a.y.raw],
        [a.z.raw],
        [a.x.diff],
        [a.y.diff],
        [a.z.diff]
    ] : 
    [
        [0],
        [0],
        [0],
        [0],
        [0],
        [0]
    ];

export const addEmptySamples(original: TensorSample[], n: number): TensorSample[] => {
    const copy: TensorSample[] = [...original];
    const remainder = original.length % n;
    for (let i = 0; i < remainder; i++) {
        copy.push(getTensorSample(null));
    }
    return copy;
}

/**
 * ?------------------
 * ? ANOMALIAS
 * * ?------------------
 */

export const predictAnomaliesCallback = (req: express.Request, res: express.Response): void => {
    res.send(["anomalies predicted!"]);
}