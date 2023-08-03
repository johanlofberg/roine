// Relative times are not in local as it adds the time-offset then
// Hence we use ISO here
export default function relativemilliSecondsToTimeStr(value, format) {

    if (value === undefined) {
        return ''
    }
    else if ((format == 'short') && (value < 60*60*3600 )) {
        return new Date(value).toISOString().substring(14, 19)
    }
    else { 
      return new Date(value).toISOString().substring(11, 19)     
    }
}

export function niceAbsoluteTimeFormat(value) {
    // In the project, all stored time is in core Date() format
    // Hence, when displaying as strings we must go to local time    
    return value.toLocaleString('sv').slice(11, 19)
}