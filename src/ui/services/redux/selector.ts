import { useSelector as _useSelector } from "react-redux";
import {_dynamicRequestSelector} from './slices';

export function useDynamicSelector(key: any){
    const _data = _useSelector((state)=>_dynamicRequestSelector(state,key));
    return _data || {};
}