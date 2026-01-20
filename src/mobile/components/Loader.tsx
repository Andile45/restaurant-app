import {View,ActivityIndicator,StyleSheet} from 'react-native';
import { colors } from '../theme/colors';

interface LoaderProps{
    fullscreen?:boolean;
};

export const Loader = ({fullscreen=false}:LoaderProps)=>{

    return(
        <View style={[styles.container, fullscreen&&styles.fullscreen]}>
           <ActivityIndicator size='large' color={colors.primary} />
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
      padding:16,
      alignItems:'center',
      justifyContent:'center'
    },
    fullscreen:{
     flex:1,
     backgroundColor:'rgba(255,255,255,0.8)'
    },
});