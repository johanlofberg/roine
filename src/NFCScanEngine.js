export default async function NFCScanEngine(setNFCReadMessage) {
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAaa')
    if ('NDEFReader' in window) {
        try {
            const ndef = new window.NDEFReader();
            await ndef.scan();

    //        console.log("Scan started successfully.");
            ndef.onreadingerror = () => {
               // console.log("Cannot read data from the NFC tag. Try another one?");
                setNFCReadMessage("NDEF Failed.")                
            };
            ndef.onreading = event => {
              //  console.log("NDEF message read.");
                setNFCReadMessage("NDEF message read.")
                onReading(event);
            };

        } catch (error) {
            //console.log(`Error! Scan failed to start: ${error}.`);
            setNFCReadMessage("Massivefail.")
        };
    } 
    else{
      //  console.log('No NFC reader available')
        setNFCReadMessage("NDE not available")
    }
}

const onReading = ({ message, serialNumber }) => {    
    for (const record of message.records) {
        switch (record.recordType) {
            case "text":
//                console.log(record)
                break;
            case "url":
                // TODO: Read URL record with record data.
                break;
            default:
            // TODO: Handle other records with record data.
        }
    }
};
