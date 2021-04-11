package access_type_pkg is
    generic(type T_in; type T_out);
    type access_t is protected
        procedure set(val: T_out);
        impure function get return T_in;

        -- NOTE: For internal use only,
        --       i.e. don't use these in a testbench.
        impure function get_outputs return T_out;
        procedure set_inputs(val: T_in);
    end protected;
end package;

package body access_type_pkg is
    type access_t is protected body
        variable outputs: T_out;
        variable inputs: T_in;

        procedure set(val: T_out) is
        begin
            outputs := val;
        end procedure;
        impure function get return T_in is
        begin
            return inputs;
        end function;

        procedure set_inputs(val: T_in) is
        begin
            inputs := val;
        end procedure;

        impure function get_outputs return T_out is
        begin
            return outputs;
        end function;
    end protected body;
end package body;
