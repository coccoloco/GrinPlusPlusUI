import React from "react";
import PropTypes from "prop-types";
import { ipcRenderer } from 'electron';
import {Grid, FormControl, Input, InputLabel, IconButton } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import SaveAltIcon from '@material-ui/icons/SaveAlt';

const styles = theme => ({
    fileChooserButton: {
        marginTop: theme.spacing.unit,
        marginLeft: -theme.spacing.unit
    },
});

function SendFile(props) {
    const { classes, selected, selectedFile, setSelectedFile } = props;
    
    function handleSelectFile(event) {
        ipcRenderer.removeAllListeners('DestinationSelected');
        ipcRenderer.once('DestinationSelected', (event, file) => {
            if (file != null) {
                setSelectedFile(file);
            }
        });

        ipcRenderer.send('SendFile');
    }

    if (selected != true) {
        return null;
    }

    return (
        <Grid container spacing={8}>
            <Grid item xs={11}>
                <FormControl
                    margin="dense"
                    required
                    fullWidth
                >
                    <InputLabel htmlFor="destinationFile">Destination File</InputLabel>
                    <Input
                        name="destinationFile"
                        type="text"
                        id="destinationFile"
                        value={selectedFile}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={1}>
                <IconButton onClick={handleSelectFile} className={classes.fileChooserButton}>
                    <SaveAltIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}

SendFile.propTypes = {
    classes: PropTypes.object.isRequired,
    selected: PropTypes.bool,
    selectedFile: PropTypes.string,
    setSelectedFile: PropTypes.func
};

export default withStyles(styles)(SendFile);